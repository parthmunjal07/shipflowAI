import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { KanbanBoard, KanbanTask } from "../../../../components/kanban-board";

export default async function TasksPage({
  params
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect("/auth");
  }

  const organization = await prisma.organization.findFirst({
    where: { slug: workspaceId }
  });

  if (!organization) {
    redirect("/auth");
  }

  const dbTasks = await prisma.task.findMany({
    where: { project: { organizationId: organization.id } },
    include: {
      assignee: true,
      featureRequest: {
        include: {
          prd: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const formattedTasks: KanbanTask[] = dbTasks.map(t => ({
    id: t.id,
    title: t.title,
    ac: t.description,
    initials: t.assignee?.name?.substring(0, 2).toUpperCase() || "UN",
    dotColor: "bg-blue-500", // Default dot color for now
    avatarColor: "bg-gray-600",
    status: t.status
  }));

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-[28px] font-black text-white tracking-tight mb-2">
          Global Task Board
        </h1>
        <p className="text-[14px] text-[#a1a1aa]">
          Manage all tasks across your workspace
        </p>
      </div>
      
      <KanbanBoard initialTasks={formattedTasks} />
    </div>
  );
}
