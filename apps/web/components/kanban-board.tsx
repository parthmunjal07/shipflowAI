"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Filter, AlertTriangle, Plus, MoreHorizontal, Link2, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";

// Database Task Statuses
type DBTaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type KanbanTask = {
  id: string;
  title: string;
  ac: string;
  initials: string;
  dotColor: string;
  avatarColor: string;
  status: DBTaskStatus;
};

const COLUMNS: { id: DBTaskStatus; title: string; badgeColor: string }[] = [
  { id: "TODO", title: "To Do", badgeColor: "bg-white/[0.05] text-[#a1a1aa]" },
  { id: "IN_PROGRESS", title: "In Progress", badgeColor: "bg-brand-mint/20 text-brand-mint" },
  { id: "IN_REVIEW", title: "In Review", badgeColor: "bg-purple-500/20 text-purple-400" },
  { id: "DONE", title: "Done", badgeColor: "bg-green-500/20 text-green-400" }
];

export function KanbanBoard({ 
  initialTasks, 
  featureRequestId 
}: { 
  initialTasks: KanbanTask[],
  featureRequestId?: string 
}) {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const router = useRouter();

  const updateStatusMutation = trpc.featureRequest.updateTaskStatus.useMutation();
  const generateTasksMutation = trpc.featureRequest.generateTasks.useMutation({
    onSuccess: () => {
      // Refresh to get newly generated tasks
      router.refresh();
    }
  });

  // Sync state if initialTasks prop changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as DBTaskStatus;

    // Optimistic UI update
    setTasks((prev) => {
      const updated = [...prev];
      const taskIndex = updated.findIndex((t) => t.id === draggableId);
      if (taskIndex > -1) {
        const [movedTask] = updated.splice(taskIndex, 1);
        if (movedTask) {
          movedTask.status = newStatus;
          
          const destTasks = updated.filter(t => t.status === newStatus);
          const targetDestTask = destTasks[destination.index];
          
          if (targetDestTask) {
            const insertIndex = updated.findIndex(t => t.id === targetDestTask.id);
            updated.splice(insertIndex, 0, movedTask);
          } else {
            updated.push(movedTask);
          }
        }
      }
      return updated;
    });

    // Fire mutation
    try {
      await updateStatusMutation.mutateAsync({
        taskId: draggableId,
        status: newStatus
      });
    } catch (e) {
      console.error("Failed to update status", e);
      // Revert optimistic update by syncing with props
      setTasks(initialTasks);
    }
  };

  const handleGenerate = () => {
    generateTasksMutation.mutate({ featureRequestId });
  };

  if (!isClient) return null;

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<DBTaskStatus, KanbanTask[]>);

  const hasTasks = tasks.length > 0;

  return (
    <>
      {/* Kanban Board Area */}
      {!hasTasks && (
        <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl p-8 mb-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-bold text-white mb-2">Empty state</h2>
              <p className="text-[#a1a1aa] text-[14px]">Generate tasks from the PRD acceptance criteria to populate this board.</p>
            </div>
            {featureRequestId && (
              <button 
                onClick={handleGenerate}
                disabled={generateTasksMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand-mint text-brand-dark font-bold/10 hover:bg-brand-mint text-brand-dark font-bold/20 border border-brand-mint/20 transition-colors text-brand-mint text-[13px] font-medium rounded-lg disabled:opacity-50"
              >
                {generateTasksMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Tasks from PRD
              </button>
            )}
          </div>
          
          <div className="border border-dashed border-[#27272a] bg-surface-base rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-brand-mint/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-brand-mint" />
            </div>
            <h3 className="text-[16px] font-bold text-white mb-2">No tasks yet</h3>
            <p className="text-[#71717a] text-[14px]">Generate tasks from the PRD acceptance criteria to populate this board.</p>
          </div>
        </div>
      )}

      {hasTasks && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 mb-12 overflow-x-auto pb-4">
            
            {COLUMNS.map((column) => (
              <div key={column.id} className="w-[320px] flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-bold text-white">{column.title}</h2>
                    <span className={`px-2 py-0.5 rounded-md text-[12px] font-semibold ${column.badgeColor}`}>
                      {tasksByColumn[column.id].length}
                    </span>
                  </div>
                  <button className="text-[#71717a] hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-3 p-3 rounded-2xl border transition-colors min-h-[150px] ${
                        snapshot.isDraggingOver ? "bg-surface-card/80 border-brand-mint/30" : "bg-surface-card border-[#27272a]/50"
                      }`}
                    >
                      {column.id === "TODO" && (
                        <button className="flex items-center justify-center gap-2 w-full py-4 bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-[#27272a] rounded-xl text-[#a1a1aa] hover:text-white text-[13px] font-medium transition-colors">
                          <Plus className="w-4 h-4" />
                          Add task
                        </button>
                      )}

                      {tasksByColumn[column.id].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <TaskCard 
                                task={task} 
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

          </div>
        </DragDropContext>
      )}
    </>
  );
}

function TaskCard({ task, isDragging }: { task: KanbanTask, isDragging: boolean }) {
  let borderClass = "border-[#27272a]";
  if (task.status === "IN_PROGRESS") borderClass = "border-l-2 border-l-brand-mint border-t-[#27272a] border-r-[#27272a] border-b-[#27272a]";
  if (task.status === "IN_REVIEW") borderClass = "border-l-2 border-l-purple-500 border-t-[#27272a] border-r-[#27272a] border-b-[#27272a]";
  if (task.status === "DONE") borderClass = "border-l-2 border-l-emerald-500 border-t-[#27272a] border-r-[#27272a] border-b-[#27272a]";

  if (isDragging) {
    borderClass = "border-2 border-brand-mint shadow-xl shadow-brand-mint/20 rotate-2";
  }

  return (
    <div className={`bg-surface-elevated rounded-xl p-4 border ${borderClass} hover:border-[#52525b] transition-colors cursor-grab`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-[#71717a] tracking-widest">TSK-{task.id.slice(-4).toUpperCase()}</span>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold ${task.avatarColor}`}>
          {task.initials}
        </div>
      </div>
      
      <h3 className="text-[14px] font-semibold text-white/90 leading-snug mb-3">
        {task.title}
      </h3>
      
      <div className="flex items-start gap-2 mb-4">
        <Link2 className="w-3.5 h-3.5 text-[#52525b] shrink-0 mt-0.5" />
        <span className="text-[12px] text-[#71717a] leading-tight line-clamp-2">
          {task.ac}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#27272a]/30">
        {task.status === "DONE" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <div className={`w-2 h-2 rounded-full ${task.dotColor}`} />
        )}
        
        {task.status === "DONE" ? (
          <div className={`w-2 h-2 rounded-full ${task.dotColor}`} />
        ) : (
          <Clock className="w-4 h-4 text-[#52525b]" />
        )}
      </div>
    </div>
  );
}
