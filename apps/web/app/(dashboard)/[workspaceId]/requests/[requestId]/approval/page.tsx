import React from "react";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ApprovalClient } from "./components/approval-client";

export default async function FinalApprovalPage({ 
  params 
}: { 
  params: Promise<{ workspaceId: string, requestId: string }>;
}) {
  const { workspaceId, requestId } = await params;
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/auth");
  }

  // Find the organization
  const organization = await prisma.organization.findFirst({
    where: { slug: workspaceId }
  });

  if (!organization) {
    redirect("/default/requests");
  }

  // Fetch the feature request with PRD and tasks and their PRs
  const featureRequest = await prisma.featureRequest.findFirst({
    where: { 
      id: requestId, 
      project: { organizationId: organization.id } 
    },
    include: {
      prd: true,
      tasks: {
        orderBy: { number: 'asc' },
        include: {
          pullRequests: {
            include: {
              reviewRuns: {
                orderBy: { createdAt: 'desc' },
                include: { issues: true },
              }
            }
          }
        }
      }
    }
  });

  if (!featureRequest) {
    notFound();
  }

  // We can fetch user role from members if needed, for now just mockup
  const member = await prisma.member.findFirst({
    where: { userId: session.user.id, organizationId: organization.id }
  });

  return (
    <ApprovalClient 
      featureRequest={featureRequest} 
      userName={session.user.name || session.user.email} 
      userRole={member?.role || "Team Member"} 
    />
  );
}
