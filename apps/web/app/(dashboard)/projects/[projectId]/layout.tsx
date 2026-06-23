import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const pendingApprovalsCount = await prisma.featureRequest.count({
    where: {
      projectId,
      status: "READY_FOR_APPROVAL" as any,
      project: { organizationId: activeOrganizationId }
    },
  });

  return (
    <div className="flex flex-1 min-h-0 bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-900 truncate">{project.name}</h2>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <Link
            href={`/projects/${projectId}`}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-900 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Pipeline
            {pendingApprovalsCount > 0 && (
              <span className="ml-auto bg-purple-100 text-purple-700 py-0.5 px-2 rounded-full text-xs font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </Link>
          <Link
            href={`/projects/${projectId}/settings`}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
