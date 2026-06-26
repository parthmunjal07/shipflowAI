"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Filter, AlertTriangle, Plus, MoreHorizontal, Link2, Clock, CheckCircle2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type TaskStatus = "todo" | "in-progress" | "done";

type Task = {
  id: string;
  title: string;
  ac: string;
  initials: string;
  dotColor: string;
  avatarColor: string;
  status: TaskStatus;
};

const INITIAL_TASKS: Task[] = [
  { id: "TSK-041", title: "Add export button to ReportView component", ac: "AC: Export button appears on all report views", initials: "JL", dotColor: "bg-red-500", avatarColor: "bg-blue-600", status: "todo" },
  { id: "TSK-042", title: "Mask PII fields by default in export payload", ac: "AC: PII fields are masked unless admin overrides", initials: "PN", dotColor: "bg-amber-500", avatarColor: "bg-[#27272a]", status: "todo" },
  { id: "TSK-043", title: "Add row count preview modal", ac: "AC: Export opens confirmation modal with row count", initials: "MW", dotColor: "bg-[#52525b]", avatarColor: "bg-[#27272a]", status: "todo" },
  { id: "TSK-044", title: "Implement CSV serializer with streaming support", ac: "AC: Exports over 10k rows are streamed", initials: "SK", dotColor: "bg-red-500", avatarColor: "bg-blue-600", status: "in-progress" },
  { id: "TSK-045", title: "Wire export permission checks into toolbar", ac: "AC: Export button appears only for permitted users", initials: "DP", dotColor: "bg-amber-500", avatarColor: "bg-[#27272a]", status: "in-progress" },
  { id: "TSK-046", title: "Add streaming progress indicator", ac: "AC: Progress shown during large exports", initials: "AO", dotColor: "bg-[#52525b]", avatarColor: "bg-blue-600", status: "in-progress" },
  { id: "TSK-037", title: "Write unit tests for CSV streaming edge cases", ac: "AC: Streaming handles empty, large, and interrupted exports", initials: "TE", dotColor: "bg-[#52525b]", avatarColor: "bg-emerald-600", status: "done" },
  { id: "TSK-038", title: "Add export analytics event tracking", ac: "AC: Export completion emits analytics event", initials: "LZ", dotColor: "bg-amber-500", avatarColor: "bg-emerald-600", status: "done" },
  { id: "TSK-039", title: "Update empty state copy for no-data exports", ac: "AC: Empty dataset shows informative message", initials: "JL", dotColor: "bg-[#52525b]", avatarColor: "bg-emerald-600", status: "done" }
];

const COLUMNS: { id: TaskStatus; title: string; badgeColor: string }[] = [
  { id: "todo", title: "To Do", badgeColor: "bg-white/[0.05] text-[#a1a1aa]" },
  { id: "in-progress", title: "In Progress", badgeColor: "bg-blue-500/20 text-blue-400" },
  { id: "done", title: "Done", badgeColor: "bg-green-500/20 text-green-400" }
];

export default function TaskBoardPage() {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;

    setTasks((prev) => {
      const updated = [...prev];
      const taskIndex = updated.findIndex((t) => t.id === draggableId);
      if (taskIndex > -1) {
        const [movedTask] = updated.splice(taskIndex, 1);
        movedTask.status = newStatus;
        
        // Find correct insertion index in the full array based on the droppable destination index
        const destTasks = updated.filter(t => t.status === newStatus);
        const targetDestTask = destTasks[destination.index];
        
        if (targetDestTask) {
          const insertIndex = updated.findIndex(t => t.id === targetDestTask.id);
          updated.splice(insertIndex, 0, movedTask);
        } else {
          updated.push(movedTask);
        }
      }
      return updated;
    });
  };

  if (!isClient) return null;

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="flex-1 h-full bg-[#0A0D14] overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full p-8 lg:p-12 pb-32">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
              <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
              <span className="text-[10px]">&gt;</span>
              <span className="hover:text-white cursor-pointer transition-colors">Add CSV export to reports</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa]">Tasks</span>
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-2">
              Task Board
            </h1>
            <div className="text-[14px]">
              <span className="text-[#71717a]">Linked PRD: </span>
              <span className="text-blue-500 hover:text-blue-400 cursor-pointer transition-colors font-medium">Add CSV export to reports</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 mt-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
              Generate Tasks
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#27272a] hover:bg-white/[0.03] transition-colors text-white text-[13px] font-medium rounded-lg">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-8 text-amber-500/90 text-[14px] font-medium">
          <AlertTriangle className="w-5 h-5" />
          3 tasks are not yet linked to a PRD acceptance criterion — link them to enable traceability.
        </div>

        {/* Kanban Board */}
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
                        snapshot.isDraggingOver ? "bg-[#13161F]/80 border-blue-500/30" : "bg-[#13161F] border-[#27272a]/50"
                      }`}
                    >
                      {column.id === "todo" && (
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

        {/* Empty State Block */}
        <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-bold text-white mb-2">Empty state</h2>
              <p className="text-[#a1a1aa] text-[14px]">Generate tasks from the PRD acceptance criteria to populate this board.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 transition-colors text-blue-500 text-[13px] font-medium rounded-lg">
              <Sparkles className="w-4 h-4" />
              Generate Tasks from PRD
            </button>
          </div>
          
          <div className="border border-dashed border-[#27272a] bg-[#0A0D14] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-[16px] font-bold text-white mb-2">No tasks yet</h3>
            <p className="text-[#71717a] text-[14px]">Generate tasks from the PRD acceptance criteria to populate this board.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function TaskCard({ task, isDragging }: { task: Task, isDragging: boolean }) {
  let borderClass = "border-[#27272a]";
  if (task.status === "in-progress") borderClass = "border-l-2 border-l-blue-500 border-t-[#27272a] border-r-[#27272a] border-b-[#27272a]";
  if (task.status === "done") borderClass = "border-l-2 border-l-emerald-500 border-t-[#27272a] border-r-[#27272a] border-b-[#27272a]";

  if (isDragging) {
    borderClass = "border-2 border-blue-500 shadow-xl shadow-blue-900/20 rotate-2";
  }

  return (
    <div className={`bg-[#1A1E29] rounded-xl p-4 border ${borderClass} hover:border-[#52525b] transition-colors cursor-grab`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-[#71717a] tracking-widest">{task.id}</span>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold ${task.avatarColor}`}>
          {task.initials}
        </div>
      </div>
      
      <h3 className="text-[14px] font-semibold text-white/90 leading-snug mb-3">
        {task.title}
      </h3>
      
      <div className="flex items-start gap-2 mb-4">
        <Link2 className="w-3.5 h-3.5 text-[#52525b] shrink-0 mt-0.5" />
        <span className="text-[12px] text-[#71717a] leading-tight">
          {task.ac}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#27272a]/30">
        {task.status === "done" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <div className={`w-2 h-2 rounded-full ${task.dotColor}`} />
        )}
        
        {task.status === "done" ? (
          <div className={`w-2 h-2 rounded-full ${task.dotColor}`} />
        ) : (
          <Clock className="w-4 h-4 text-[#52525b]" />
        )}
      </div>
    </div>
  );
}
