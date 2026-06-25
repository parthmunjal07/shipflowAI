import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Rocket } from "lucide-react";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const activeOrganizationId = session?.session?.activeOrganizationId;

  if (!activeOrganizationId) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== activeOrganizationId) {
    notFound();
  }

  // Fetch pending approvals
  const pendingApprovals = await prisma.featureRequest.findMany({
    where: {
      projectId,
      status: "READY_FOR_APPROVAL" as any,
      project: { organizationId: activeOrganizationId }
    },
    orderBy: {
      updatedAt: "asc", // Oldest waiting first
    },
    include: {
      tasks: true,
      prd: true,
    },
  });

  // Fetch in progress
  const inProgress = await prisma.featureRequest.findMany({
    where: {
      projectId,
      status: "IN_PROGRESS",
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{project.name} Pipeline</h1>
        <p className="text-gray-600">Track and manage feature development across the project.</p>
      </div>

      <div className="space-y-12">
        {/* Ready for Approval Inbox */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold">Ready for Approval</h2>
            {pendingApprovals.length > 0 && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                {pendingApprovals.length} Waiting
              </span>
            )}
          </div>
          
          {pendingApprovals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 border border-gray-200 border-dashed rounded-2xl">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">You're all caught up!</h3>
              <p className="text-gray-500 text-center max-w-sm">
                No feature requests are waiting for human approval right now.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingApprovals.map(req => (
                <div key={req.id} className="bg-white border-l-4 border-l-purple-500 border-y border-r border-gray-200 rounded-r-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{req.title}</h3>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Waiting {formatDistanceToNow(new Date(req.updatedAt))}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-1">{req.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        {(req as any).tasks?.length || 0} Tasks
                      </span>
                    </div>
                  </div>
                  <Link 
                    href={`/projects/${projectId}/requests/${req.id}/approval`}
                    className="shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-2 px-6 rounded-lg transition-colors text-center"
                  >
                    Review &amp; Approve &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* In Progress */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold">In Progress</h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              {inProgress.length} Features
            </span>
          </div>

          {inProgress.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 border border-gray-200 border-dashed rounded-2xl">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Nothing in flight</h3>
              <p className="text-gray-500 text-center max-w-sm">
                No features are currently in active development. Approve a PRD plan to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgress.map(req => (
                <Link key={req.id} href={`/projects/${projectId}/requests/${req.id}`} className="block">
                  <div className="bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-5 shadow-sm transition-colors h-full flex flex-col">
                    <h3 className="font-bold mb-2 line-clamp-2">{req.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{req.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                      <span>Updated {formatDistanceToNow(new Date(req.updatedAt))} ago</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
