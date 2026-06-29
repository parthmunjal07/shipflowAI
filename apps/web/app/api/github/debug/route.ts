import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const installations = await prisma.githubInstallation.findMany({ include: { organization: true, repositories: true } });
  const orgs = await prisma.organization.findMany({ select: { id: true, slug: true, name: true } });
  
  // Force link to the 'testing' workspace
  const targetOrg = orgs.find(o => o.id === 'obIvvXR6hSPZPOchaLGuk1TulzPYGPqW') || orgs.find(o => o.slug === 'testing');
  
  if (targetOrg) {
    for (const inst of installations) {
      if (inst.organizationId !== targetOrg.id) {
        await prisma.githubInstallation.update({
          where: { id: inst.id },
          data: { organizationId: targetOrg.id }
        });
        inst.organizationId = targetOrg.id;
      }
    }
  }

  return NextResponse.json({
    message: "Debug & Fix complete. All installations forced to testing workspace.",
    installations,
    orgs
  });
}
