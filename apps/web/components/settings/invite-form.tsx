"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";

export function InviteForm({ 
  workspaceId, 
  workspaceName 
}: { 
  workspaceId: string,
  workspaceName: string 
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin" | "owner">("member"); // 'owner' is not standard better-auth org default unless extended, but 'member'/'admin' are standard.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await authClient.organization.inviteMember({
        email,
        role: role,
        organizationId: workspaceId,
      });

      if (error) {
        setError(error.message || "Failed to send invitation.");
      } else {
        setSuccess(true);
        setEmail("");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-semibold text-white/90">Invite to {workspaceName}</h2>
        <X className="w-4 h-4 text-[#52525b] hover:text-white cursor-pointer transition-colors" />
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/90">Email address</label>
          <input 
            type="email" 
            placeholder="colleague@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full bg-surface-base border border-[#27272a]/50 rounded-xl px-3 py-2.5 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-white/90">Role</label>
          <div className="relative">
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              disabled={loading}
              className="w-full bg-surface-base border border-[#27272a]/50 rounded-xl px-3 py-2.5 text-[14px] text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#52525b]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-[13px]">{error}</p>}
        {success && <p className="text-green-400 text-[13px]">Invitation sent successfully!</p>}

        <button 
          onClick={handleInvite}
          disabled={loading || !email.trim()}
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 bg-brand-mint hover:bg-brand-mintHover text-brand-dark font-bold text-[14px] font-medium transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Send Invite
        </button>
      </div>
    </div>
  );
}
