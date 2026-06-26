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

  // 2. Handle state-based installation (Started from ShipFlow)
  if (stateToken) {
    const stateRecord = await (prisma as any).githubInstallState.findUnique({
      where: { token: stateToken },
    });

    if (!stateRecord) {
      return NextResponse.json({ error: "Invalid or expired state token." }, { status: 400 });
    }

    if (stateRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "State token has expired." }, { status: 400 });
    }

    targetOrgId = stateRecord.organizationId;

    // Verify current user session actually has access to this org
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    // In a full implementation, check user's role in the org via member query.
    // For now, if they have an active session in that org, we accept it.
    if (session.session.activeOrganizationId !== targetOrgId) {
       return NextResponse.json({ error: "Unauthorized. Active organization mismatch." }, { status: 403 });
    }

    // Optional: delete state to prevent reuse
    await (prisma as any).githubInstallState.delete({ where: { id: stateRecord.id } });
  }

  // 3. Security Check: Prevent claiming an already claimed installation
  if (existingInstallation && existingInstallation.organizationId) {
    if (existingInstallation.organizationId !== targetOrgId) {
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
    return NextResponse.redirect(new URL(`/${targetOrgId}/settings?tab=integrations`, request.url));
  } else {
    // Fallback if no specific org state was provided
    return NextResponse.redirect(new URL("/default/settings?tab=integrations", request.url));
  }
}
