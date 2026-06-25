"use client";

import { trpc } from "../../../../../trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntegrationsPage() {
  const router = useRouter();
  const { data: installation, isLoading, refetch } = trpc.github.getInstallation.useQuery();
  const removeMutation = trpc.github.removeInstallation.useMutation();
  const claimMutation = trpc.github.claimInstallation.useMutation();
  
  const [claimId, setClaimId] = useState("");

  const handleInstall = () => {
    window.location.href = "/api/github/install";
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to disconnect GitHub?")) return;
    await removeMutation.mutateAsync();
    refetch();
    router.refresh();
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId) return;
    try {
      await claimMutation.mutateAsync({ installationId: parseInt(claimId, 10) });
      setClaimId("");
      refetch();
      router.refresh();
    } catch (err) {
      alert("Failed to claim installation. It may be invalid or already claimed.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-64">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="h-9 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full max-w-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Integrations</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">GitHub</h2>
              <p className="text-gray-500 text-sm mt-1">
                Link ShipFlow to your GitHub organization to track pull requests automatically.
              </p>
            </div>
          </div>

          <div>
            {!installation ? (
              <button 
                onClick={handleInstall}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Connect GitHub
              </button>
            ) : (
              <button 
                onClick={handleRemove}
                disabled={removeMutation.isPending}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {removeMutation.isPending ? "Disconnecting..." : "Disconnect"}
              </button>
            )}
          </div>
        </div>

        {installation && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium text-gray-700">
                Connected to <strong className="text-gray-900">{installation.accountName}</strong>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-4">
              Installation ID: {installation.installationId}
            </p>
          </div>
        )}

        {!installation && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Claim Existing Installation</h4>
            <p className="text-xs text-gray-500 mb-4">
              If you installed the GitHub App directly from the marketplace, you can claim it here by providing the Installation ID.
            </p>
            <form onSubmit={handleClaim} className="flex gap-2">
              <input
                type="text"
                placeholder="Installation ID (e.g., 12345678)"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                disabled={!claimId || claimMutation.isPending}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
              >
                Claim
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
