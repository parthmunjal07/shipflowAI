"use client";

import { useState } from "react";
import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

type Project = {
  id: string;
  name: string;
};

export function NewFeatureRequestDialog({
  workspaceId,
  projects = []
}: {
  workspaceId: string;
  projects: Project[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const router = useRouter();

  const utils = trpc.useUtils();
  
  const createMutation = trpc.featureRequest.createInternal.useMutation({
    onSuccess: (data: any) => {
      setIsOpen(false);
      setTitle("");
      setContent("");
      // Force refresh server components
      router.refresh();
      // Also optionally redirect to the new request
      router.push(`/${workspaceId}/requests/${data.featureRequest.id}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !projectId) return;
    createMutation.mutate({ title, content, projectId });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-medium transition-colors gap-2"
      >
        <Plus className="w-4 h-4" />
        New Feature Request
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#27272a]/50">
              <h2 className="text-[18px] font-bold text-white">New Feature Request</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#71717a] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {projects.length === 0 ? (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  You need to create a project first before creating a feature request.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-white/90">Project</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full bg-[#0A0D14] border border-[#27272a]/50 rounded-lg px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-white/90">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Add dark mode support"
                      className="w-full bg-[#0A0D14] border border-[#27272a]/50 rounded-lg px-4 py-2.5 text-[14px] text-white placeholder-[#71717a] focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-white/90">Description</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Describe the feature, why it's needed, and how it should work..."
                      className="w-full bg-[#0A0D14] border border-[#27272a]/50 rounded-lg px-4 py-3 text-[14px] text-white placeholder-[#71717a] focus:outline-none focus:border-blue-500 transition-colors min-h-[120px] resize-y"
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-[#27272a] hover:bg-white/[0.02] text-[#a1a1aa] hover:text-white text-[14px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || projects.length === 0}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium transition-colors flex items-center gap-2"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
