import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Activity, AlertTriangle } from "lucide-react";
import { prisma } from "@repo/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { NewFeatureRequestDialog } from "../../../components/new-feature-request-dialog";
import { WorkspaceSwitcher } from "../../../components/workspace-switcher";
import { CreateProjectButton } from "../../../components/create-project-button";

export default async function DashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth");
  }

  // Find the organization
  const organization = await prisma.organization.findFirst({
    where: { OR: [{ slug: workspaceId }, { id: workspaceId }] },
    include: { projects: true }
  });

  if (!organization) {
    notFound();
  }

  const orgId = organization.id;

  // Aggregate Stats
  const [
    requestCount,
    prdCount,
    taskCount,
    codeCount,
    shippedCount,
    pendingRequests,
    inProgressTasks
  ] = await Promise.all([
    prisma.featureRequest.count({ where: { project: { organizationId: orgId } } }),
    prisma.pRD.count({ where: { featureRequest: { project: { organizationId: orgId } } } }),
    prisma.task.count({ where: { project: { organizationId: orgId } } }),
    prisma.pullRequest.count({ where: { repository: { installation: { organizationId: orgId } } } }),
    prisma.featureRequest.count({ where: { project: { organizationId: orgId }, status: 'SHIPPED' } }),
    prisma.featureRequest.count({ where: { project: { organizationId: orgId }, status: 'PENDING' } }),
    prisma.task.count({ where: { project: { organizationId: orgId }, status: 'IN_PROGRESS' } }),
  ]);

  const stats = [
    { label: "REQUEST", value: requestCount.toString(), color: "bg-brand-mint text-brand-dark font-bold" },
    { label: "PRD", value: prdCount.toString(), color: "bg-brand-mint text-brand-dark font-bold" },
    { label: "TASKS", value: taskCount.toString(), color: "bg-indigo-500" },
    { label: "CODE", value: codeCount.toString(), color: "bg-blue-400" },
    { label: "IN PROGRESS", value: inProgressTasks.toString(), color: "bg-yellow-500" },
    { label: "PENDING", value: pendingRequests.toString(), color: "bg-amber-500" },
    { label: "HUMAN APPROVAL", value: "0", color: "bg-brand-mint text-brand-dark font-bold" }, // Placeholder for future feature
    { label: "SHIPPED", value: shippedCount.toString(), color: "bg-green-500" },
  ];

  // Fetch recent activity
  const recentRequests = await prisma.featureRequest.findMany({
    where: { project: { organizationId: orgId } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { project: true }
  });

  const recentTasks = await prisma.task.findMany({
    where: { project: { organizationId: orgId } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { project: true }
  });

  const recentPRs = await prisma.pullRequest.findMany({
    where: { repository: { installation: { organizationId: orgId } } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { repository: true }
  });

  const rawActivity = [
    ...recentRequests.map(r => ({
      type: "request",
      title: `New Feature Request: ${r.title}`,
      desc: r.project.name,
      createdAt: r.createdAt,
      linkText: `View Request in ${r.project.name}`,
      href: `/${workspaceId}/requests/${r.id}`,
      dot: "bg-brand-mint text-brand-dark font-bold"
    })),
    ...recentTasks.map(t => ({
      type: "task",
      title: `Task Created: ${t.title}`,
      desc: t.project.name,
      createdAt: t.createdAt,
      linkText: `View Tasks`,
      href: `/${workspaceId}/tasks`,
      dot: "bg-indigo-500"
    })),
    ...recentPRs.map(pr => ({
      type: "pr",
      title: `PR #${pr.number} ${pr.state}: ${pr.title}`,
      desc: pr.repository.fullName,
      createdAt: pr.createdAt,
      linkText: `View in GitHub`,
      href: pr.url,
      dot: pr.state === 'closed' ? (pr.mergedAt ? "bg-purple-500" : "bg-red-500") : "bg-green-500"
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);

  const recentActivity = rawActivity.map(a => ({
    ...a,
    time: formatDistanceToNow(a.createdAt, { addSuffix: true })
  }));

  if (recentActivity.length === 0) {
    recentActivity.push({
      type: "empty",
      title: "No recent activity yet.",
      desc: "Start by creating a feature request or linking a GitHub repository.",
      createdAt: new Date(),
      time: "",
      linkText: "",
      href: "#",
      dot: "bg-gray-500"
    });
  }

  // Needs Attention
  const attentionRequests = await prisma.featureRequest.findMany({
    where: { project: { organizationId: orgId }, status: 'PENDING' },
    take: 3,
  });

  const needsAttention = attentionRequests.map(r => ({
    title: `Feature request pending: ${r.title}`,
    href: `/${workspaceId}/requests/${r.id}`
  }));

  if (needsAttention.length === 0) {
    needsAttention.push({
      title: "All caught up! No pending items.",
      href: "#"
    });
  }

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        
        {/* Workspace Dropdown */}
        <WorkspaceSwitcher />
      </div>

      {/* Funnel Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface-card border border-[#27272a]/50 rounded-xl p-4 flex flex-col relative overflow-hidden group">
            <span className="text-[10px] font-bold text-[#71717a] tracking-wider mb-2 uppercase">{stat.label}</span>
            <span className="text-3xl font-semibold text-white tracking-tight">{stat.value}</span>
            <div className={`absolute bottom-0 left-4 right-4 h-1 ${stat.color} rounded-t-full opacity-80`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 bg-surface-card border border-[#27272a]/50 rounded-2xl p-6">
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
                  {activity.href !== "#" && (
                    <Link href={activity.href} className="text-[13px] text-brand-mint hover:text-brand-mint mt-1">
                      {activity.linkText}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Needs Attention */}
          <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-semibold text-white/90">Needs Attention</h2>
              <AlertTriangle className="w-4 h-4 text-amber-500/80" />
            </div>
            <div className="space-y-3">
              {needsAttention.map((item, i) => (
                <Link href={item.href} key={i} className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group cursor-pointer">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/70" />
                  <p className="text-[13px] text-white/90 leading-relaxed font-medium pl-2">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-semibold text-white/90">Quick Actions</h2>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#52525b]"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div className="space-y-3">
              <CreateProjectButton className="w-full py-2.5" />
              <NewFeatureRequestDialog workspaceId={workspaceId} projects={organization.projects} />
              <Link href={`/${workspaceId}/github`} className="flex items-center justify-center w-full py-2.5 rounded-lg bg-transparent border border-white/[0.05] hover:bg-white/[0.03] text-[#a1a1aa] hover:text-white text-[14px] font-medium transition-colors">
                Manage GitHub Repos
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
