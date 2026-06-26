"use client";

import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
};

export function PendingInvites({ invites }: { invites: PendingInvite[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    setLoadingId(id);
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId: id,
      });
      if (!error) {
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (invites.length === 0) return null;

  return (
    <div>
      <h3 className="text-[14px] font-medium text-white/90 mb-3 px-1">
        Pending Invites ({invites.length})
      </h3>
      <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl flex flex-col divide-y divide-[#27272a]/50">
        {invites.map((invite) => (
          <div key={invite.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors first:rounded-t-2xl last:rounded-b-2xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-white/90">{invite.email}</span>
              <span className="text-[12px] text-[#71717a] capitalize">
                {invite.role} · Expires {new Date(invite.expiresAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="text-[12px] text-[#a1a1aa] hover:text-white transition-colors disabled:opacity-50"
                disabled={loadingId === invite.id}
              >
                Resend
              </button>
              <button 
                onClick={() => handleRevoke(invite.id)}
                disabled={loadingId === invite.id}
                className="text-[12px] text-[#a1a1aa] flex items-center gap-1 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {loadingId === invite.id && <Loader2 className="w-3 h-3 animate-spin" />}
                Revoke
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
