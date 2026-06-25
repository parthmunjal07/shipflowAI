"use client";

import React, { useState, useEffect } from "react";
import { authClient, useActiveOrganization } from "../../../../../lib/auth-client";
import { Mail, Shield, User, Loader2, MoreVertical, ShieldAlert } from "lucide-react";

export function MembersTable() {
  const { data: activeOrg } = useActiveOrganization();
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);

  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      if (!activeOrg?.id) return;
      try {
        setIsLoading(true);
        const { data: orgData } = await authClient.organization.getFullOrganization({
          query: { organizationId: activeOrg.id }
        });
        if (orgData) {
          setMembers(orgData.members);
          setInvites(orgData.invitations);
        }

        const session = await authClient.getSession();
        if (session?.data && session.data.user) {
          setCurrentUserId(session.data.user.id);
          const currentMember = orgData?.members.find((m: any) => m.userId === session!.data!.user.id);
          if (currentMember) {
            setCurrentUserRole(currentMember.role);
          }
        }

      } catch (error) {
        console.error("Failed to load members", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeOrg?.id]);

  const canManageMembers = currentUserRole === "owner" || currentUserRole === "admin";
  const canRemoveMember = (targetRole: string) => {
    if (currentUserRole === "owner") return true;
    if (currentUserRole === "admin" && targetRole !== "owner") return true;
    return false;
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setIsInviting(true);
    const { data, error } = await authClient.organization.inviteMember({
      email: inviteEmail,
      role: inviteRole as "member" | "admin" | "owner",
    });
    
    if (data) {
      setInviteEmail("");
      // Optimistic addition to invites list could be done here, or just reload
      const { data: orgData } = await authClient.organization.getFullOrganization({
        query: { organizationId: activeOrg!.id }
      });
      if (orgData) setInvites(orgData.invitations);
    } else {
      console.error(error);
      alert("Failed to invite member");
    }
    setIsInviting(false);
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    const { data, error } = await authClient.organization.updateMemberRole({
      memberId,
      role: newRole as "member" | "admin" | "owner",
    });
    
    if (data) {
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } else {
      console.error(error);
      alert("Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    const { data, error } = await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
    });
    
    if (data) {
      setMembers(members.filter(m => m.id !== memberId));
    } else {
      console.error(error);
      alert("Failed to remove member");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    const { data, error } = await authClient.organization.cancelInvitation({
      invitationId: inviteId,
    });
    
    if (data) {
      setInvites(invites.filter(i => i.id !== inviteId));
    } else {
      console.error(error);
      alert("Failed to cancel invitation");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 pb-5">
          <div className="h-8 bg-gray-200 rounded w-48 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Invite Form Skeleton */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 h-28"></div>

        {/* Members List Skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header section */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Members & Roles</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage who has access to {activeOrg?.name}. Owners have full access, Admins can manage product settings, and Members can execute tasks.
        </p>
      </div>

      {/* Invite form */}
      {canManageMembers && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Invite New Member</h3>
          <form onSubmit={handleInvite} className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  placeholder="colleague@company.com"
                />
              </div>
            </div>
            <div className="w-48">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                {currentUserRole === "owner" && <option value="owner">Owner</option>}
              </select>
            </div>
            <button
              type="submit"
              disabled={isInviting || !inviteEmail}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 flex items-center"
            >
              {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send Invite"}
            </button>
          </form>
        </div>
      )}

      {/* Members List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Active Members</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => {
              const isSelf = member.userId === currentUserId;
              return (
                <li key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-medium">
                      {member.user.name?.charAt(0).toUpperCase() || member.user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {member.user.name || "Unknown"}
                        {isSelf && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-normal">You</span>}
                      </p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${member.role === 'owner' ? 'bg-indigo-100 text-indigo-800' : ''}
                      ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                      ${member.role === 'member' ? 'bg-gray-100 text-gray-800' : ''}
                    `}>
                      {member.role === 'owner' && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {member.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {member.role === 'member' && <User className="w-3 h-3 mr-1" />}
                      {member.role}
                    </span>

                    {canManageMembers && !isSelf && canRemoveMember(member.role) && (
                      <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md focus:ring-black focus:border-black py-1 pl-2 pr-8"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          {currentUserRole === "owner" && <option value="owner">Owner</option>}
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pending Invitations</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {invites.map((invite) => (
                <li key={invite.id} className="p-4 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-4 opacity-70">
                    <div className="w-10 h-10 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{invite.email}</p>
                      <p className="text-xs text-gray-500">Invited as {invite.role}</p>
                    </div>
                  </div>
                  {canManageMembers && (
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-sm text-gray-500 hover:text-gray-900 font-medium px-2 py-1"
                    >
                      Cancel
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
