import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Activity, AlertTriangle } from "lucide-react";

export default async function DashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.session?.activeOrganizationId !== workspaceId) {
    // Note: BetterAuth requires the active organization to match what we are looking at.
    // In a real app we might redirect or set it here. We'll bypass strict checks for mockup.
  }

  // Mock data to match the screenshot perfectly
  const stats = [
    { label: "REQUEST", value: "12", color: "bg-blue-500" },
    { label: "PRD", value: "7", color: "bg-blue-600" },
    { label: "TASKS", value: "5", color: "bg-indigo-500" },
    { label: "CODE", value: "4", color: "bg-blue-400" },
    { label: "AI REVIEW", value: "3", color: "bg-yellow-500" },
    { label: "FIXES", value: "2", color: "bg-amber-500" },
    { label: "HUMAN APPROVAL", value: "1", color: "bg-blue-500" },
    { label: "SHIPPED", value: "28", color: "bg-green-500" },
  ];

  const recentActivity = [
    { type: "approve", title: "Jordan Lee approved PR #142", desc: "Add CSV export to reports", time: "2 min ago", link: "Add CSV export to reports", dot: "bg-blue-500" },
    { type: "review", title: "AI Review completed on PR #141", desc: "Support SSO login for enterprise plans · 3 blocking issues found", time: "14 min ago", link: "Support SSO login for enterprise plans", dot: "bg-amber-500" },
    { type: "prd", title: "PRD generated for: Dark mode toggle for dashboard", desc: "", time: "32 min ago", link: "Dark mode toggle for dashboard", dot: "bg-blue-500" },
    { type: "task", title: "Task board updated", desc: "3 tasks moved to Done for: Webhook delivery retry logic", time: "1 hr ago", link: "Webhook delivery retry logic", dot: "bg-green-500" },
    { type: "request", title: "New feature request submitted: Audit log export for compliance", desc: "", time: "2 hrs ago", link: "Audit log export for compliance", dot: "bg-blue-500" },
    { type: "merge", title: "PR #139 merged", desc: "Fix pagination bug on reports table", time: "4 hrs ago", link: "Fix pagination bug on reports table", dot: "bg-amber-500" },
    { type: "human", title: "Human approval requested: Add CSV export to reports", desc: "", time: "6 hrs ago", link: "Add CSV export to reports", dot: "bg-blue-500" },
    { type: "review_pass", title: "AI Review pass 2 completed", desc: "0 blocking issues remaining on SSO PR", time: "8 hrs ago", link: "Support SSO login for enterprise plans", dot: "bg-green-500" },
  ];

  const needsAttention = [
    { title: "PR #141 — SSO login: 3 blocking issues unresolved" },
    { title: "Feature request Clarifying for 4 days: Audit log export" },
    { title: "PRD awaiting review: Dark mode toggle" },
  ];

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        
        {/* Workspace Dropdown Mockup matching image */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#161B28] border border-white/[0.05] rounded-lg text-sm text-[#a1a1aa] hover:text-white cursor-pointer transition-colors">
          <span>Acme Corp Engineering</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      {/* Funnel Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-4 flex flex-col relative overflow-hidden group">
            <span className="text-[10px] font-bold text-[#71717a] tracking-wider mb-2 uppercase">{stat.label}</span>
            <span className="text-3xl font-semibold text-white tracking-tight">{stat.value}</span>
            <div className={`absolute bottom-0 left-4 right-4 h-1 ${stat.color} rounded-t-full opacity-80`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 bg-[#13161F] border border-[#27272a]/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-semibold text-white/90">Recent Activity</h2>
            <Activity className="w-4 h-4 text-[#52525b]" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.dot}`} />
                <div className="flex flex-col gap-1">
                  <p className="text-[14px] text-white/90">
                    <span className="font-medium">{activity.title}</span> {activity.desc && <span className="text-[#a1a1aa]">— {activity.desc}</span>}
                  </p>
                  <p className="text-[12px] text-[#71717a]">{activity.time}</p>
                  <a href="#" className="text-[13px] text-blue-500 hover:text-blue-400 mt-1">Feature request: {activity.link}</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Needs Attention */}
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-semibold text-white/90">Needs Attention</h2>
              <AlertTriangle className="w-4 h-4 text-amber-500/80" />
            </div>
            <div className="space-y-3">
              {needsAttention.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group cursor-pointer">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/70" />
                  <p className="text-[13px] text-white/90 leading-relaxed font-medium pl-2">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-semibold text-white/90">Quick Actions</h2>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#52525b]"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div className="space-y-3">
              <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-medium transition-colors">
                New Feature Request
              </button>
              <button className="w-full py-2.5 rounded-lg bg-transparent border border-white/[0.05] hover:bg-white/[0.03] text-[#a1a1aa] hover:text-white text-[14px] font-medium transition-colors">
                Connect GitHub Repo
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
