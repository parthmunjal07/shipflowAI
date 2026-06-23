import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

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
  // If targetOrgId is null, it stays unclaimed.
  await (prisma as any).githubInstallation.upsert({
    where: { installationId },
    update: {
      organizationId: targetOrgId,
      // Ideally we fetch the accountName from GitHub API, but we'll hardcode a placeholder for now
      // until we implement the octokit verification in Phase 4.
      accountName: "github-account", 
    },
    create: {
      installationId,
      organizationId: targetOrgId,
      accountName: "github-account", // To be updated via webhook or fetch
    },
  });

  // Redirect to Integrations UI
  return NextResponse.redirect(new URL("/org/settings/integrations", request.url));
}
