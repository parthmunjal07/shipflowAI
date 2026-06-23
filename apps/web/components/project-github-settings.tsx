"use client";

import { useState } from "react";
import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ProjectGithubSettings({ projectId }: { projectId: string }) {
  const router = useRouter();
  
  const { data: linkedRepos, refetch: refetchLinked, isLoading: loadingLinked } = trpc.github.getProjectRepos.useQuery({ projectId });
  const { data: availableRepos, error, isLoading: loadingAvailable } = trpc.github.listAvailableRepos.useQuery(undefined, {
    retry: false, // Don't retry if it throws a configuration error
  });

  const linkMutation = trpc.github.linkProjectRepo.useMutation();
  const unlinkMutation = trpc.github.unlinkProjectRepo.useMutation();

  const [selectedRepoId, setSelectedRepoId] = useState<string>("");

  const handleLink = async () => {
    if (!selectedRepoId || !availableRepos) return;
    const repo = availableRepos.find((r) => r.id.toString() === selectedRepoId);
    if (!repo) return;

    await linkMutation.mutateAsync({
      projectId,
      repoId: repo.id,
      fullName: repo.fullName,
    });
    
    setSelectedRepoId("");
    refetchLinked();
    router.refresh();
  };

  const handleUnlink = async (repoId: number) => {
    if (!confirm("Are you sure you want to disconnect this repository from the project?")) return;
    
    await unlinkMutation.mutateAsync({ projectId, repoId });
    refetchLinked();
    router.refresh();
  };

  // If there's an error and it's our typed GITHUB_NOT_CONFIGURED error
  const isNotConfigured = error?.message === "GITHUB_NOT_CONFIGURED";

  if (loadingLinked || (loadingAvailable && !error)) {
    return <div className="text-gray-500 text-sm">Loading GitHub settings...</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">GitHub Repositories</h2>
        <p className="text-sm text-gray-500 mt-1">
          Link GitHub repositories to this project to enable the AI Review Agent to analyze pull requests automatically.
        </p>
      </div>

      <div className="p-6">
        {isNotConfigured ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-yellow-900 mb-1">GitHub Not Configured</h3>
            <p className="text-sm text-yellow-800 mb-3">
              This organization does not have a connected GitHub App, or the credentials are missing/invalid on the server.
            </p>
            <Link 
              href="/org/settings/integrations"
              className="inline-flex items-center px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-900 text-sm font-medium rounded-md transition-colors"
            >
              Configure in Organization Settings
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Currently Linked Repositories */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Linked Repositories</h3>
              
              {!linkedRepos || linkedRepos.length === 0 ? (
                <div className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md border border-gray-100">
                  No repositories linked to this project yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {linkedRepos.map((repo: any) => (
                    <li key={repo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        <span className="text-sm font-medium text-gray-900">{repo.fullName}</span>
                      </div>
                      <button 
                        onClick={() => handleUnlink(repo.repoId)}
                        disabled={unlinkMutation.isPending}
                        className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Link New Repository */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-2">Link Another Repository</h3>
              
              {availableRepos && availableRepos.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={selectedRepoId}
                    onChange={(e) => setSelectedRepoId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a repository...</option>
                    {availableRepos.map((repo: any) => {
                      // Don't show repos that are already linked
                      const isLinked = linkedRepos?.some((r: any) => r.repoId === repo.id);
                      if (isLinked) return null;
                      
                      return (
                        <option key={repo.id} value={repo.id}>
                          {repo.fullName}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    onClick={handleLink}
                    disabled={!selectedRepoId || linkMutation.isPending}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {linkMutation.isPending ? "Linking..." : "Link"}
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No repositories available to link. Ensure you have granted the GitHub App access to your repositories.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
