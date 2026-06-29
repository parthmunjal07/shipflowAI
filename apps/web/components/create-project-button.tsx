"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";

export function CreateProjectButton({ 
  label = "Create Project", 
  icon = true,
  className = ""
}: { 
  label?: string; 
  icon?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setName("");
      setDescription("");
      router.refresh(); // Refresh the page to show the new project
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-brand-mint text-brand-dark font-bold text-[13px] rounded-lg hover:bg-brand-mintHover transition-colors ${className}`}
      >
        {icon && <Plus className="w-4 h-4" />}
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-[#27272a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[#27272a]/50">
              <h2 className="text-xl font-bold text-white tracking-tight">Create Project</h2>
              <p className="text-[13px] text-[#a1a1aa] mt-1">Add a new project to organize feature requests and tasks.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="name" className="block text-[13px] font-medium text-white/90 mb-1.5">
                  Project Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-base border border-[#27272a] rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-brand-mint/50 transition-colors"
                  placeholder="e.g. Acme Web App"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-[13px] font-medium text-white/90 mb-1.5">
                  Description <span className="text-[#52525b] font-normal">(optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-base border border-[#27272a] rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-brand-mint/50 transition-colors min-h-[100px] resize-y"
                  placeholder="What is this project about?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[#a1a1aa] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || createMutation.isPending}
                  className="bg-brand-mint text-brand-dark font-bold px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-brand-mintHover transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
