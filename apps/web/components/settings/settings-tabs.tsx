"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function SettingsTabs({ workspaceId }: { workspaceId: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "members";

  return (
    <div className="flex gap-6 border-b border-[#27272a]/50">
      <Link 
        href={`/${workspaceId}/settings?tab=members`}
        className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${
          tab === "members" ? "text-white border-blue-500" : "text-[#71717a] border-transparent hover:text-white/80"
        }`}
      >
        Members
      </Link>
      <Link 
        href={`/${workspaceId}/settings?tab=integrations`}
        className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${
          tab === "integrations" ? "text-white border-blue-500" : "text-[#71717a] border-transparent hover:text-white/80"
        }`}
      >
        Integrations
      </Link>
      <button 
        className="pb-3 text-[14px] font-medium text-[#71717a]/50 cursor-not-allowed border-b-2 border-transparent" 
        title="Coming soon"
        disabled
      >
        General
      </button>
    </div>
  );
}
