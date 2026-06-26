"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createFeatureRequest } from "../../app/(dashboard)/[workspaceId]/requests/actions";

export function NewRequestModal({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm"
      >
        <Plus className="w-4 h-4" />
        New Request
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      const res = await createFeatureRequest(projectId, title, content);
      setIsOpen(false);
      setTitle("");
      setContent("");
      router.push(`?id=${res.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm"
      >
        <Plus className="w-4 h-4" />
        New Request
      </button>

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-[#13161F] border border-[#27272a] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-[#27272a]/50">
            <h2 className="text-[16px] font-bold text-white tracking-tight">Submit Feature Request</h2>
            <button onClick={() => setIsOpen(false)} className="text-[#71717a] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-white/90 mb-1.5">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Export reports to CSV"
                className="w-full bg-[#0A0D14] border border-[#27272a]/50 rounded-xl py-2.5 px-4 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-blue-500/50 transition-colors"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-white/90 mb-1.5">Description</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Explain the problem and proposed solution..."
                className="w-full h-32 bg-[#0A0D14] border border-[#27272a]/50 rounded-xl py-2.5 px-4 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-transparent text-[#a1a1aa] hover:text-white text-[13px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || !title || !content}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
