import { NextResponse } from "next/server";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let organizationId = session.session?.activeOrganizationId;

  if (!organizationId) {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    
    if (workspaceId) {
      const org = await prisma.organization.findFirst({
        where: { slug: workspaceId }
      });
      if (org) {
        organizationId = org.id;
      }
    }
  }

  if (!organizationId) {
    return NextResponse.json({ error: "Unauthorized or no active organization." }, { status: 401 });
  }

  const userId = session.user.id;

  // Generate a secure random state token
  const token = crypto.randomBytes(32).toString("hex");

  // Store the state securely in the database
  await (prisma as any).githubInstallState.create({
    data: {
      token,
      organizationId,
      userId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });

  // Redirect to GitHub App installation page with the state
  const githubAppName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || "the-wharf-local-dev";
  const githubInstallUrl = `https://github.com/apps/${githubAppName}/installations/new?state=${token}`;

  return NextResponse.redirect(githubInstallUrl);
}
