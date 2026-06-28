import React from "react";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { KanbanBoard, KanbanTask } from "../../../../../../components/kanban-board";
import { PlanApprovalBanner } from "../../../../../../components/plan-approval-banner";
import Link from "next/link";
import { Filter } from "lucide-react";

export default async function RequestTasksPage({ 
  params 
}: { 
  params: Promise<{ workspaceId: string, requestId: string }>;
}) {
  const { workspaceId, requestId } = await params;
  
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/auth");
  }

  // Find the organization
  const organization = await prisma.organization.findFirst({
    where: { slug: workspaceId }
  });

  if (!organization) {
    redirect("/default/requests");
  }

  // Fetch the feature request and tasks
  const featureRequest = await prisma.featureRequest.findFirst({
    where: { 
      id: requestId, 
      project: { organizationId: organization.id } 
    },
    include: {
      tasks: {
        orderBy: { number: 'asc' },
        include: { assignee: true }
      },
      prd: true
    }
  });

  if (!featureRequest) {
    notFound();
  }

  // Map DB tasks to KanbanTasks
  const kanbanTasks: KanbanTask[] = featureRequest.tasks.map(task => {
    // Generate some deterministic colors based on task ID for mockup purposes
    // (In a real app, this might come from tags or assignee colors)
    const colorClasses = [
      { dot: "bg-red-500", avatar: "bg-blue-600" },
      { dot: "bg-amber-500", avatar: "bg-[#27272a]" },
      { dot: "bg-[#52525b]", avatar: "bg-emerald-600" },
      { dot: "bg-purple-500", avatar: "bg-pink-600" },
    ];
    const colorIdx = task.number % colorClasses.length;
    const colors = colorClasses[colorIdx]!;

    return {
      id: task.id,
      title: task.title,
      ac: task.satisfiedAcceptanceCriteria?.[0] || task.description.slice(0, 100),
      initials: task.assignee?.name?.substring(0, 2).toUpperCase() || "UN",
      dotColor: colors.dot,
      avatarColor: colors.avatar,
      status: task.status
    };
  });

  return (
    <div className="flex-1 h-full bg-[#0A0D14] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full p-8 lg:p-12 pb-32">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
              <Link href={`/${workspaceId}/requests`} className="hover:text-white cursor-pointer transition-colors">Feature Requests</Link>
              <span className="text-[10px]">&gt;</span>
              <Link href={`/${workspaceId}/requests?id=${requestId}`} className="hover:text-white cursor-pointer transition-colors max-w-[250px] truncate block">{featureRequest.title}</Link>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa]">Tasks</span>
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-2">
              Task Board
            </h1>
            <div className="text-[14px]">
              <span className="text-[#71717a]">Linked PRD: </span>
              <Link href={`/${workspaceId}/requests?id=${requestId}`} className="text-blue-500 hover:text-blue-400 cursor-pointer transition-colors font-medium">
                {featureRequest.title}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 mt-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#27272a] hover:bg-white/[0.03] transition-colors text-white text-[13px] font-medium rounded-lg">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Plan Approval Banner */}
        {featureRequest.status === "PLANNED" && (
          <PlanApprovalBanner featureRequestId={featureRequest.id} />
        )}

        {/* Kanban Board */}
        <KanbanBoard 
          initialTasks={kanbanTasks} 
          featureRequestId={featureRequest.id} 
        />

      </div>
    </div>
  );
}
