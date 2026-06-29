"use client";

import { useState } from "react";
import { Link2, Unlink, Plus, Loader2, GitBranch, ExternalLink } from "lucide-react";
import { trpc } from "../../trpc/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@repo/api";

type Repository = {
  id: string;
  fullName: string;
  repoId: number;
};

export function RepositoryManager({
  projectId,
  workspaceId,
  linkedRepositories,
  availableRepositories,
  hasInstallation
}: {
  projectId: string;
  workspaceId: string;
  linkedRepositories: Repository[];
  availableRepositories: Repository[];
  hasInstallation: boolean;
}) {
  const router = useRouter();
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const linkMutation = trpc.project.linkRepository.useMutation({
    onSuccess: () => {
      setSelectedRepoId("");
      setIsLinking(false);
      router.refresh();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      alert(error.message);
      setIsLinking(false);
    }
  });

  const unlinkMutation = trpc.project.unlinkRepository.useMutation({
    onSuccess: () => {
      setUnlinkingId(null);
      router.refresh();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      alert(error.message);
      setUnlinkingId(null);
    }
  });

  const handleLink = () => {
    if (!selectedRepoId) return;
    setIsLinking(true);
    linkMutation.mutate({ projectId, repositoryId: selectedRepoId });
  };

  const handleUnlink = (repositoryId: string) => {
    if (confirm("Are you sure you want to unlink this repository? Tasks for this project will no longer be mapped to it.")) {
      setUnlinkingId(repositoryId);
      unlinkMutation.mutate({ projectId, repositoryId });
    }
  };

  return (
    <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl overflow-hidden mb-8">
      <div className="p-6 border-b border-[#27272a]/50 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-brand-mint" />
            Linked Repositories
          </h2>
          <p className="text-[13px] text-[#a1a1aa] mt-1">
            Repositories where the AI will create tasks and pull requests for this project.
          </p>
        </div>
      </div>

      <div className="p-6">
        {!hasInstallation || (linkedRepositories.length === 0 && availableRepositories.length === 0) ? (
          <div className="text-center p-8 border border-[#27272a]/50 border-dashed rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#27272a] flex items-center justify-center mx-auto mb-4">
              <GitBranch className="w-6 h-6 text-[#52525b]" />
            </div>
            <h3 className="text-[15px] font-bold text-white mb-2">No GitHub Repositories Connected</h3>
            <p className="text-[13px] text-[#71717a] max-w-[320px] mx-auto mb-6">
              You need to connect the GitHub App to your workspace before you can link repositories to projects.
            </p>
            <Link 
              href={`/${workspaceId}/github`}
              className="inline-flex items-center justify-center px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors text-[13px] font-bold rounded-lg shadow-sm"
            >
              Configure GitHub Integration
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Linked Repos List */}
            {linkedRepositories.length > 0 ? (
              <div className="space-y-3">
                {linkedRepositories.map((repo) => (
                  <div key={repo.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-mint/[0.08] flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-brand-mint" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-white">{repo.fullName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={`https://github.com/${repo.fullName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-[#71717a] hover:text-white transition-colors"
                        title="View on GitHub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleUnlink(repo.id)}
                        disabled={unlinkingId === repo.id}
                        className="p-2 text-[#71717a] hover:text-red-400 transition-colors"
                        title="Unlink Repository"
                      >
                        {unlinkingId === repo.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Unlink className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-[#71717a] p-4 bg-white/[0.01] rounded-xl border border-white/[0.02]">
                No repositories linked yet. Link one below to get started.
              </div>
            )}

            {/* Link New Repo Form */}
            {availableRepositories.length > 0 && (
              <div className="pt-4 border-t border-[#27272a]/50">
                <label className="block text-[13px] font-medium text-white/90 mb-2">
                  Link another repository
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedRepoId}
                    onChange={(e) => setSelectedRepoId(e.target.value)}
                    className="flex-1 bg-surface-base border border-[#27272a] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-brand-mint/50 transition-colors"
                  >
                    <option value="">Select a repository...</option>
                    {availableRepositories.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.fullName}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleLink}
                    disabled={!selectedRepoId || isLinking}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-mint text-brand-dark font-bold text-[13px] rounded-xl hover:bg-brand-mintHover transition-colors disabled:opacity-50"
                  >
                    {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
