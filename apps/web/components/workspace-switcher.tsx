"use client";

import { useState, useRef, useEffect } from "react";
import { useActiveOrganization, useListOrganizations, authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";
import { Check, Plus, Loader2, Building, AlertCircle } from "lucide-react";

export function WorkspaceSwitcher() {
  const { data: activeOrg } = useActiveOrganization();
  const { data: orgs, isLoading } = useListOrganizations();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create Form State
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = async (orgId: string, slug: string) => {
    setIsOpen(false);
    await authClient.organization.setActive({ organizationId: orgId });
    router.push(`/${slug || orgId}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !newOrgSlug.trim()) return;
    
    setIsCreating(true);
    setError(null);
    try {
      const { data, error: createError } = await authClient.organization.create({
        name: newOrgName,
        slug: newOrgSlug,
      });
      
      if (createError) {
        throw new Error(createError.message || "Failed to create workspace");
      }
      
      if (data) {
        setIsCreateModalOpen(false);
        setNewOrgName("");
        setNewOrgSlug("");
        // Switch to the newly created organization
        await handleSwitch(data.id, data.slug || data.id);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#161B28] border border-white/[0.05] rounded-lg text-sm text-[#a1a1aa] hover:text-white cursor-pointer transition-colors"
      >
        <span>{activeOrg?.name || "Select Workspace"}</span>
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          className={`opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[240px] bg-[#13161F] border border-[#27272a]/50 rounded-xl shadow-2xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2">
            <div className="px-2 py-1.5 text-[11px] font-bold text-[#71717a] tracking-wider uppercase mb-1">
              Workspaces
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 text-[#71717a] animate-spin" />
              </div>
            ) : (
              <div className="space-y-0.5">
                {orgs?.map((org: any) => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitch(org.id, org.slug || org.id)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="truncate">{org.name}</span>
                    {activeOrg?.id === org.id && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-[#27272a]/50 bg-[#0A0D14]/50">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-blue-500 hover:bg-blue-500/10 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              New Workspace
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-6 border-b border-[#27272a]/50">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-white">Create Workspace</h2>
                <p className="text-[13px] text-[#71717a]">Set up a new organization</p>
              </div>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[13px]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-white/90">Workspace Name</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-[#0A0D14] border border-[#27272a]/50 rounded-lg px-4 py-2.5 text-[14px] text-white placeholder-[#71717a] focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-white/90">Workspace URL Slug</label>
                <div className="flex items-center">
                  <span className="bg-[#161B28] border border-r-0 border-[#27272a]/50 rounded-l-lg px-3 py-2.5 text-[14px] text-[#71717a]">
                    shipflow.ai/
                  </span>
                  <input
                    type="text"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="acme-corp"
                    className="w-full bg-[#0A0D14] border border-[#27272a]/50 rounded-r-lg px-4 py-2.5 text-[14px] text-white placeholder-[#71717a] focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <p className="text-[12px] text-[#71717a]">Only lowercase letters, numbers, and hyphens.</p>
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-[#27272a] hover:bg-white/[0.02] text-[#a1a1aa] hover:text-white text-[14px] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newOrgName || !newOrgSlug}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium transition-colors flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
