import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

type GithubInstallation = {
  id: string;
  accountName: string;
  repositories: {
    id: string;
    fullName: string;
  }[];
};

export function IntegrationsTab({ 
  installation,
  workspaceId
}: { 
  installation: GithubInstallation | null,
  workspaceId: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#27272a] flex items-center justify-center text-white">
              <GithubIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-white/90">GitHub</h2>
              <p className="text-[13px] text-[#a1a1aa] mt-0.5">Sync repositories and track pull requests</p>
            </div>
          </div>
          
          {installation ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[12px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </div>
          ) : (
            <Link 
              href={`/api/github/install?workspaceId=${workspaceId}`}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 text-[13px] font-medium transition-colors"
            >
              Connect App
            </Link>
          )}
        </div>

        {installation ? (
          <div className="border-t border-[#27272a]/50 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-medium text-white/90">
                Connected Account: <span className="text-white font-bold">{installation.accountName}</span>
              </h3>
              <a 
                href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'the-wharf-local-dev'}/installations/new`}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-brand-mint hover:text-brand-mint font-medium transition-colors"
              >
                Configure in GitHub
              </a>
            </div>

            <div className="flex flex-col divide-y divide-[#27272a]/50 border border-[#27272a]/50 rounded-xl overflow-hidden bg-surface-base">
              {installation.repositories.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-[#71717a]">
                  No repositories synced yet. Configure the app in GitHub to grant access.
                </div>
              ) : (
                installation.repositories.map((repo) => (
                  <div key={repo.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <span className="text-[14px] text-white/90 font-medium">{repo.fullName}</span>
                    <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noreferrer" className="text-[#52525b] hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="border-t border-[#27272a]/50 pt-6">
            <p className="text-[13px] text-[#a1a1aa] leading-relaxed max-w-2xl">
              Connect your workspace to GitHub to automatically sync repositories, generate PRDs from issues, and have The Wharf review your pull requests. You can selectively grant access to specific repositories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
