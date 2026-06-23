import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { ProjectGithubSettings } from "../../../../../components/project-github-settings";

export default async function ProjectSettingsPage({
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
        <p className="text-gray-500 mt-2">Manage configurations for {project.name}</p>
      </div>

      <div className="space-y-8">
        {/* GitHub Integration Section */}
        <section>
          <ProjectGithubSettings projectId={projectId} />
        </section>
        
        {/* Future settings sections can go here */}
      </div>
    </div>
  );
}
