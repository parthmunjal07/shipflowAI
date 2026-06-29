import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Folder } from "lucide-react";
import { CreateProjectButton } from "../../../../components/create-project-button";

export default async function ProjectsPage({ 
  params
}: { 
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/auth");
  }

  // Find the organization
  const organization = await prisma.organization.findFirst({
    where: { OR: [{ slug: workspaceId }, { id: workspaceId }] }
  });

  if (!organization) {
    redirect("/default");
  }

  // Fetch all projects for this organization with their counts
  const projects = await prisma.project.findMany({
    where: { organizationId: organization.id },
    include: {
      _count: {
        select: { featureRequests: { where: { status: { not: "SHIPPED" } } } }
      },
      repositories: true // Just need the count
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Projects</h1>
          <p className="text-[14px] text-[#a1a1aa]">Manage your projects and link them to GitHub repositories.</p>
        </div>
        <CreateProjectButton />
      </div>

      <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_2fr_2fr_2fr] gap-4 px-6 py-4 border-b border-[#27272a]/50 bg-white/[0.01]">
          <div className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">Project Name</div>
          <div className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider text-center">Open Requests</div>
          <div className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider text-center">Linked Repos</div>
          <div className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider text-right">Last Activity</div>
        </div>

        {/* Table Body */}
        {projects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#27272a] flex items-center justify-center mb-4">
              <Folder className="w-6 h-6 text-[#52525b]" />
            </div>
            <h3 className="text-[15px] font-bold text-white mb-2">No projects found</h3>
            <p className="text-[14px] text-[#71717a] max-w-[300px] mx-auto mb-6">
              Create a project to start organizing your feature requests and tasks.
            </p>
            <CreateProjectButton />
          </div>
        ) : (
          <div className="divide-y divide-[#27272a]/30">
            {projects.map((project) => (
              <Link 
                key={project.id}
                href={`/${workspaceId}/projects/${project.id}`}
                className="grid grid-cols-[3fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                {/* Project Name & Desc */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-mint/[0.08] text-brand-mint flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-white/90 truncate group-hover:text-brand-mint transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-[13px] text-[#71717a] truncate mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Open Requests */}
                <div className="text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold ${
                    project._count.featureRequests > 0 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-white/[0.03] text-[#71717a] border border-[#27272a]/50'
                  }`}>
                    {project._count.featureRequests}
                  </span>
                </div>

                {/* Linked Repos */}
                <div className="text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-bold ${
                    project.repositories.length > 0 
                      ? 'bg-brand-mint/10 text-brand-mint border border-brand-mint/20' 
                      : 'bg-white/[0.03] text-[#71717a] border border-[#27272a]/50'
                  }`}>
                    {project.repositories.length}
                  </span>
                </div>

                {/* Last Activity */}
                <div className="text-right text-[13px] font-medium text-[#71717a]">
                  {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
