import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FolderGit2 } from "lucide-react";
import { CreateProjectButton } from "../../../components/create-project-button";

export default async function DashboardHomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const activeOrganizationId = session?.session?.activeOrganizationId;

  if (!activeOrganizationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 mt-20">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <FolderGit2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Shipflow!</h2>
        <p className="text-gray-500 text-center max-w-md mb-8">
          To get started with generating PRDs and managing projects, you need to create your first workspace.
        </p>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600 flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-xs">1</span>
          Click on "Select Workspace" in the top-left corner
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600 flex items-center gap-3 mt-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-xs">2</span>
          Click "Create Workspace" and enter a name
        </div>
      </div>
    );
  }

  const projects = await prisma.project.findMany({
    where: { organizationId: activeOrganizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your products and feature requests.</p>
        </div>
        <CreateProjectButton />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-gray-200 border-dashed rounded-2xl">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-500 text-center max-w-sm mb-6">
            Create your first project to start generating PRDs, managing tasks, and automating code reviews.
          </p>
          <CreateProjectButton label="Create Project" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link 
              href={`/projects/${project.id}`} 
              key={project.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 transition-colors">
                  <FolderGit2 className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{project.description || "No description provided."}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
