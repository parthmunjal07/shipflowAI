import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { App } from "octokit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const installationIdStr = searchParams.get("installation_id");
  const stateToken = searchParams.get("state");

  if (!installationIdStr) {
    return NextResponse.json({ error: "Missing installation_id parameter." }, { status: 400 });
  }

  const installationId = parseInt(installationIdStr, 10);

  // 1. Check if installation is already claimed by ANY organization
  const existingInstallation = await (prisma as any).githubInstallation.findUnique({
    where: { installationId },
  });

  let targetOrgId: string | null = null;

  // 2. Handle state-based installation (Started from The Wharf)
  let session = await auth.api.getSession({ headers: await headers() });

  if (stateToken) {
    const stateRecord = await (prisma as any).githubInstallState.findUnique({
      where: { token: stateToken },
    });

    if (stateRecord && stateRecord.expiresAt > new Date()) {
      targetOrgId = stateRecord.organizationId;
      
      // Verify current user session actually has access to this org
      if (session && session.user) {
        const member = await (prisma as any).member.findFirst({
          where: {
            organizationId: targetOrgId,
            userId: session.user.id
          }
        });

        if (!member && session.session.activeOrganizationId !== targetOrgId) {
           return NextResponse.json({ error: "Unauthorized. Active organization mismatch or not a member." }, { status: 403 });
        }
      }

      // Optional: delete state to prevent reuse
      await (prisma as any).githubInstallState.delete({ where: { id: stateRecord.id } });
    }
  }

  // Fallback: If no stateToken (installed directly via GitHub) or stateToken was invalid,
  // try to use the user's active organization from their session.
  if (!targetOrgId && session && session.user) {
    if (session.session.activeOrganizationId) {
      targetOrgId = session.session.activeOrganizationId;
    } else {
      // Find the first organization the user is a part of
      const member = await (prisma as any).member.findFirst({
        where: { userId: session.user.id }
      });
      if (member) {
        targetOrgId = member.organizationId;
      }
    }
  }

  // 3. Security Check & Fallback
  if (existingInstallation && existingInstallation.organizationId) {
    if (!targetOrgId) {
      // If no state was provided (e.g. manual resync), use the existing organization
      targetOrgId = existingInstallation.organizationId;
    } else if (existingInstallation.organizationId !== targetOrgId) {
      // Security fault: Someone is trying to hijack an installation belonging to another org
      return NextResponse.json(
        { error: "This installation is already claimed by another organization." },
        { status: 403 }
      );
    }
  }

  // 4. Create or update the GithubInstallation
  // We'll fetch real data using the Octokit App client
  let accountName = "github-account"; // Fallback
  let repositories: any[] = [];

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;

  if (appId && privateKey) {
    try {
      // Fix private key formatting if passed as a single line string
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
      
      const app = new App({
        appId: appId,
        privateKey: formattedPrivateKey,
      });

      // Fetch installation details to get the account name
      const { data: installationData } = await app.octokit.request("GET /app/installations/{installation_id}", {
        installation_id: installationId,
      });
      
      if (installationData && installationData.account && 'login' in installationData.account) {
        accountName = installationData.account.login;
      }

      // Fetch the repositories accessible to this installation
      const octokit = await app.getInstallationOctokit(installationId);
      const { data: reposData } = await octokit.request("GET /installation/repositories");
      repositories = reposData.repositories || [];
    } catch (error) {
      console.error("[GitHub Setup] Error fetching installation from GitHub API:", error);
      // We will gracefully continue using the fallback name if the API call fails
    }
  } else {
    console.warn("[GitHub Setup] Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY. Skipping API fetch.");
  }

  // Create or Update the Installation record in our database
  await (prisma as any).githubInstallation.upsert({
    where: { installationId },
    update: {
      organizationId: targetOrgId,
      accountName, 
    },
    create: {
      installationId,
      organizationId: targetOrgId,
      accountName,
    },
  });

  // Sync Repositories to the database
  if (repositories.length > 0) {
    // Get the internal UUID of the installation we just created/updated
    const savedInstallation = await (prisma as any).githubInstallation.findUnique({
      where: { installationId },
      select: { id: true }
    });

    if (savedInstallation) {
      for (const repo of repositories) {
        await (prisma as any).githubRepository.upsert({
          where: { repoId: repo.id },
          update: {
            fullName: repo.full_name,
            installationId: savedInstallation.id
          },
          create: {
            repoId: repo.id,
            fullName: repo.full_name,
            installationId: savedInstallation.id
          }
        });
      }
    }
  }

  // Redirect to Integrations UI
  if (targetOrgId) {
    const org = await prisma.organization.findUnique({
      where: { id: targetOrgId }
    });
    const slug = org?.slug || 'default';
    return NextResponse.redirect(new URL(`/${slug}/settings?tab=integrations`, request.url));
  } else {
    // Fallback if no specific org state was provided
    return NextResponse.redirect(new URL("/default/settings?tab=integrations", request.url));
  }
}
