import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DirtyStateProvider } from "../../components/dirty-state-provider";
import Link from "next/link";
import { Settings, Zap, Eye, CreditCard } from "lucide-react";
import { SidebarNav } from "../../components/sidebar-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth");
  }

  // Get active org ID to build correct links (assuming /[workspaceId]/...)
  const activeOrgId = session.session?.activeOrganizationId || "default";

  return (
    <DirtyStateProvider>
      <div className="min-h-screen flex bg-surface-base text-white font-[family-name:var(--font-geist-sans)] selection:bg-brand-mint text-brand-dark font-bold/30">

        {/* Left Sidebar */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-[#27272a]/50 bg-surface-base">
          {/* Logo */}
          <div className="h-[88px] flex items-center px-6 gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-mint text-brand-dark font-bold/10 text-brand-mint flex items-center justify-center font-bold text-[14px] shadow-sm">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[14px] text-white/90 leading-tight">
                The Wharf
              </span>
              <span className="text-[12px] text-[#a1a1aa] leading-tight mt-0.5">
                Feature Ops
              </span>
            </div>
          </div>

          <SidebarNav activeOrgId={activeOrgId} />

          {/* User Profile */}
          <div className="p-4 border-t border-[#27272a]/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-brand-mint flex items-center justify-center text-brand-dark font-bold text-[13px] font-semibold shadow-inner">
                {session.user.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U"}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-[14px] font-medium text-white/90 truncate">{session.user.name}</span>
                <span className="text-[12px] text-[#71717a] truncate">Eng Manager</span>
              </div>
              <Settings className="w-4 h-4 text-[#71717a]" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </DirtyStateProvider>
  );
}
