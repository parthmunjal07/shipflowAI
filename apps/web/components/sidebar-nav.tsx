"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, KanbanSquare, GitBranch, Eye, History, CreditCard, Settings, Folder } from "lucide-react";

export function SidebarNav({ activeOrgId }: { activeOrgId: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/${activeOrgId}`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/${activeOrgId}/requests`, label: "Feature Requests", icon: FileText },
    { href: `/${activeOrgId}/prd`, label: "PRD Editor", icon: FileText },
    { href: `/${activeOrgId}/tasks`, label: "Task Board", icon: KanbanSquare },
    { divider: true },
    { href: `/${activeOrgId}/projects`, label: "Projects", icon: Folder },
    { href: `/${activeOrgId}/github`, label: "GitHub", icon: GitBranch },
    { href: `/${activeOrgId}/pull-requests`, label: "PR Review", icon: Eye },
    { href: `/${activeOrgId}/history`, label: "Review History", icon: History },
    { divider: true },
    { href: `/${activeOrgId}/billing`, label: "Billing", icon: CreditCard },
    { href: `/${activeOrgId}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      {links.map((link, i) => {
        if (link.divider) {
          return <div key={`divider-${i}`} className="my-4 border-t border-[#27272a]/50 mx-2" />;
        }

        // Exact match for dashboard, prefix match for others
        const isActive = link.href === `/${activeOrgId}` 
          ? pathname === link.href 
          : pathname?.startsWith(link.href as string);

        const Icon = link.icon!;

        return (
          <Link 
            key={link.href} 
            href={link.href as string} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              isActive 
                ? "bg-[#141A27] text-white border border-[#1E2638] shadow-sm" 
                : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-brand-mint" : ""}`} />
            <span className="text-[14px]">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
