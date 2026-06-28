import React from "react";
import { GitBranch, Plus } from "lucide-react";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GitHubIntegrationPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/auth");
  }

  const organization = await prisma.organization.findFirst({
    where: { OR: [{ slug: workspaceId }, { id: workspaceId }] },
    include: {
      githubInstallation: {
        include: { repositories: true }
      }
    }
  });

  const installation = organization?.githubInstallation;
  const repositories = installation?.repositories || [];

  return (
    <div className="flex-1 h-full bg-[#0A0D14] flex overflow-hidden">
      
      {/* Left Column - Integration Settings */}
      <div className="flex-1 overflow-y-auto border-r border-[#27272a]/50 p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="mb-10">
            <div className="text-[13px] text-[#71717a] mb-6 flex items-center gap-1.5">
              <span className="hover:text-white cursor-pointer transition-colors">Integrations</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa]">GitHub</span>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#1A1E29] border border-[#27272a] flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight mb-2">
                  GitHub Integration
                </h1>
                {installation ? (
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-[11px] font-bold tracking-wide">
                    Connected: {installation.accountName}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-[#27272a]/50 text-[#a1a1aa] border border-[#27272a] rounded-md text-[11px] font-bold tracking-wide">
                    Not Connected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Connected Repositories */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-white">Connected Repositories ({repositories.length})</h2>
              {installation ? (
                <a 
                  href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'shipflow-local-dev'}/installations/new`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-bold rounded-lg shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Install New Repo
                </a>
              ) : (
                <Link 
                  href={`/api/github/install?workspaceId=${workspaceId}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold rounded-lg shadow-sm"
                >
                  Connect App
                </Link>
              )}
            </div>
            
            <div className="space-y-3 mb-4">
              {repositories.length > 0 ? (
                repositories.map((repo: any) => (
                  <RepoCard key={repo.id} name={repo.fullName} branch="main" time="recently" url={`https://github.com/${repo.fullName}`} />
                ))
              ) : (
                <div className="p-8 text-center border border-[#27272a]/50 border-dashed rounded-xl text-[13px] text-[#71717a]">
                  No repositories synced yet. Configure the app in GitHub to grant access.
                </div>
              )}
            </div>
          </div>

          {/* Recent Pull Requests */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-white">Recent Pull Requests</h2>
            </div>
            
            <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-x-auto p-8 text-center text-[13px] text-[#71717a]">
              No recent pull requests. We'll start tracking them once you link repositories to projects!
            </div>
          </div>

        </div>
      </div>


    </div>
  );
}

// Reusable Repo Card Component
function RepoCard({ name, branch, time, url }: { name: string, branch: string, time: string, url: string }) {
  return (
    <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
          <GitBranch className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-white mb-0.5">{name}</h3>
          <p className="text-[13px] text-[#71717a]">
            Branch <span className="font-bold text-[#a1a1aa]">{branch}</span> · Synced {time}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[13px] font-bold text-emerald-500">Active</span>
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-transparent hover:bg-white/[0.04] transition-colors border border-[#27272a]/50 rounded-lg text-[13px] font-medium text-white"
        >
          View GitHub
        </a>
      </div>
    </div>
  );
}

// Removed unused PrRow and DiffLine components
