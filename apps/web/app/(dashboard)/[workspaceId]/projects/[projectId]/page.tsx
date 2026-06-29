import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Folder, ArrowLeft, FileText, CheckCircle2, Clock } from "lucide-react";
import { RepositoryManager } from "../../../../../components/projects/repository-manager";

export default async function ProjectDetailPage({ 
  params
}: { 
  params: Promise<{ workspaceId: string, projectId: string }>;
}) {
  const { workspaceId, projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/auth");
  }

  // Find the organization
  const organization = await prisma.organization.findFirst({
    where: { OR: [{ slug: workspaceId }, { id: workspaceId }] },
    include: {
      githubInstallation: {
        include: { repositories: true }
      }
    }
  });

  if (!organization) {
    redirect("/default");
  }

  // Fetch the project
  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      organizationId: organization.id 
    },
    include: {
      featureRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { name: true, email: true } }
        }
      },
      repositories: {
        include: { repository: true }
      }
    }
  });

  if (!project) {
    notFound();
  }

  // Determine repository arrays
  const hasInstallation = !!organization.githubInstallation;
  const linkedRepositories = project.repositories.map(pr => pr.repository);
  
  // Available repos = all org repos MINUS already linked repos
  const allOrgRepos = organization.githubInstallation?.repositories || [];
  const linkedRepoIds = new Set(linkedRepositories.map(r => r.id));
  const availableRepositories = allOrgRepos.filter(r => !linkedRepoIds.has(r.id));

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-5xl mx-auto w-full h-full overflow-y-auto">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <Link 
          href={`/${workspaceId}/projects`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#71717a] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
        
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-mint/[0.08] text-brand-mint flex items-center justify-center shrink-0 border border-brand-mint/20">
            <Folder className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight mb-2">
              {project.name}
            </h1>
            <p className="text-[14px] text-[#a1a1aa] max-w-2xl">
              {project.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>

      <RepositoryManager 
        projectId={project.id}
        workspaceId={workspaceId}
        linkedRepositories={linkedRepositories}
        availableRepositories={availableRepositories}
        hasInstallation={hasInstallation}
      />

      {/* Feature Requests Section */}
      <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#27272a]/50 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Feature Requests
            </h2>
            <p className="text-[13px] text-[#a1a1aa] mt-1">
              All requests associated with this project.
            </p>
          </div>
          <Link 
            href={`/${workspaceId}/requests`}
            className="text-[13px] font-bold text-brand-mint hover:text-brand-mintHover transition-colors"
          >
            View All in Workspace
          </Link>
        </div>

        <div className="divide-y divide-[#27272a]/30">
          {project.featureRequests.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#71717a]">
              No feature requests exist for this project yet.
            </div>
          ) : (
            project.featureRequests.map((request) => (
              <Link 
                key={request.id}
                href={`/${workspaceId}/requests?id=${request.id}`}
                className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    request.status === 'SHIPPED' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {request.status === 'SHIPPED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white/90 group-hover:text-indigo-400 transition-colors mb-0.5">
                      {request.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[12px] font-medium text-[#71717a]">
                      <span className="bg-white/[0.03] border border-[#27272a]/50 px-2 py-0.5 rounded text-white/70">
                        {request.status}
                      </span>
                      <span>
                        Created {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                      </span>
                      {request.createdBy?.name && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#3f3f46]"></span>
                          <span>by {request.createdBy.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
