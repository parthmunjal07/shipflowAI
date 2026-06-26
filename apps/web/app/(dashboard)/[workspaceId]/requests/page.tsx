import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RequestList } from "../../../../components/requests/request-list";
import { RequestDetail } from "../../../../components/requests/request-detail";

export default async function FeatureRequestsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { workspaceId } = await params;
  const { id: activeRequestId } = await searchParams;
  
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

  // Find or create a default project for this organization
  let project = await prisma.project.findFirst({
    where: { organizationId: organization.id }
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Default Project",
        description: "Your main project",
        organizationId: organization.id
      }
    });
  }

  // Fetch all feature requests for this project
  const requests = await prisma.featureRequest.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { name: true, email: true }
      }
    }
  });

  // Find the active request and its messages
  let activeRequest = null;
  if (requests.length > 0) {
    const targetId = activeRequestId || requests[0].id;
    activeRequest = await prisma.featureRequest.findUnique({
      where: { id: targetId },
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        clarificationMessages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <RequestList 
        requests={requests} 
        activeRequestId={activeRequest?.id || null} 
        projectId={project.id}
      />
      <RequestDetail 
        request={activeRequest} 
        workspaceId={workspaceId}
      />
    </div>
  );
}
