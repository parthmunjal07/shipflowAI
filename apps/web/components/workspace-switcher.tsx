"use client";

import React, { useState } from "react";
import { authClient, useActiveOrganization, useListOrganizations } from "../lib/auth-client";
import { useDirtyState } from "./dirty-state-provider";
import { ChevronDown, Plus, Check } from "lucide-react";

export function WorkspaceSwitcher() {
  const { data: activeOrg } = useActiveOrganization();
  const { data: orgs } = useListOrganizations();
  const { hasUnsavedChanges } = useDirtyState();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const handleSwitch = async (orgId: string) => {
    if (orgId === activeOrg?.id) return;
    
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to switch workspaces?")) {
        return;
      }
    }

    await authClient.organization.setActive({ organizationId: orgId });
    setIsOpen(false);
    window.location.reload(); // Hard reload to clear any cached states
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to switch to a new workspace?")) {
        return;
      }
    }

    const { data, error } = await authClient.organization.create({
      name: newOrgName,
      slug: newOrgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    });

    if (data) {
      await authClient.organization.setActive({ organizationId: data.id });
      setIsOpen(false);
      setIsCreating(false);
      setNewOrgName("");
      window.location.reload();
    } else {
      console.error(error);
      alert("Failed to create workspace");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <div className="w-5 h-5 rounded bg-gray-800 text-white flex items-center justify-center text-xs font-bold">
          {activeOrg?.name?.charAt(0).toUpperCase() || "O"}
        </div>
        <span className="truncate max-w-[120px]">{activeOrg?.name || "Select Workspace"}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">
                Your Workspaces
              </div>
              
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {orgs?.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitch(org.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate flex-1 font-medium text-gray-900">{org.name}</span>
                    {org.id === activeOrg?.id && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100">
                {!isCreating ? (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors text-left text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                    Create Workspace
                  </button>
                ) : (
                  <form onSubmit={handleCreate} className="px-1 py-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Workspace Name"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="flex-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newOrgName.trim()}
                        className="flex-1 px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
