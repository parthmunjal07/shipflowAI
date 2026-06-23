"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { trpc } from "../trpc/client";

// Define types locally since the generated Prisma types might be cached out-of-date in the IDE
type TaskStatusType = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskCategory = "FRONTEND" | "BACKEND" | "INFRA" | "DESIGN" | "FULLSTACK";
type TaskEffort = "S" | "M" | "L" | "XL";

export type Task = {
  id: string;
  featureRequestId: string;
  title: string;
  description: string;
  status: TaskStatusType;
  category: TaskCategory;
  effort: TaskEffort | null;
  satisfiedAcceptanceCriteria: string[];
  traceabilityNotes: string | null;
  assigneeId: string | null;
  linkedPrUrls: string[];
  pullRequests?: { id: string; number: number; title: string; reviewStatus: string }[];
  createdAt: Date;
  updatedAt: Date;
};

const COLUMNS: { id: TaskStatusType; title: string }[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

export function KanbanBoard({ initialTasks, isLocked = false, projectId }: { initialTasks: Task[], isLocked?: boolean, projectId: string }) {
  // Local state for optimistic updates
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isClient, setIsClient] = useState(false);

  const updateStatusMutation = trpc.featureRequest.updateTaskStatus.useMutation();

  // Handle SSR mismatch with drag and drop
  useEffect(() => {
    setIsClient(true);
    setTasks(initialTasks);
  }, [initialTasks]);

  const onDragEnd = async (result: DropResult) => {
    if (isLocked) return;

    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatusType;
    
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));

    try {
      await updateStatusMutation.mutateAsync({
        taskId: draggableId,
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on failure
      setTasks(previousTasks);
    }
  };

  if (!isClient) return null; // Avoid hydration mismatch for DnD

  const tasksByColumn = COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter((t) => t.status === column.id);
    return acc;
  }, {} as Record<TaskStatusType, Task[]>);

  return (
    <div className={isLocked ? "opacity-90" : ""}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]">
          {COLUMNS.map((column) => (
            <div key={column.id} className={`flex-shrink-0 w-80 flex flex-col bg-gray-50 rounded-xl border border-gray-200 ${isLocked ? 'bg-gray-100/50 border-gray-200/50' : ''}`}>
              <div className={`p-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl ${isLocked ? 'bg-gray-50/80' : 'bg-white'}`}>
                <h3 className="font-semibold text-gray-700">{column.title}</h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                  {tasksByColumn[column.id].length}
                </span>
              </div>
              
              <Droppable droppableId={column.id} isDropDisabled={isLocked}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver && !isLocked ? "bg-blue-50/50" : ""}`}
                  >
                    {tasksByColumn[column.id].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isLocked}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedTask(task)}
                            className={`mb-3 p-4 bg-white rounded-lg shadow-sm border ${snapshot.isDragging ? 'border-blue-400 shadow-md rotate-1' : 'border-gray-200'} transition-all ${isLocked ? 'cursor-pointer hover:bg-gray-50' : 'cursor-pointer hover:border-gray-300'}`}
                          >
                            <h4 className="font-medium text-sm text-gray-900 mb-2">{task.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded uppercase tracking-wider">
                                {task.category}
                              </span>
                              {task.effort && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded uppercase tracking-wider">
                                  {task.effort}
                                </span>
                              )}
                              {task.satisfiedAcceptanceCriteria.length > 0 && (
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                  {task.satisfiedAcceptanceCriteria.length} ACs
                                </span>
                              )}
                            </div>
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded uppercase">
                    {selectedTask.category}
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded uppercase">
                    Status: {selectedTask.status.replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{selectedTask.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {selectedTask.description}
                </div>
              </div>

              {selectedTask.satisfiedAcceptanceCriteria.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Satisfies Acceptance Criteria
                  </h3>
                  <ul className="space-y-2">
                    {selectedTask.satisfiedAcceptanceCriteria.map((ac: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-700 bg-purple-50/50 border border-purple-100 p-3 rounded-lg">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{ac}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedTask.traceabilityNotes && (
                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded italic border border-gray-100">
                      <strong>AI Note:</strong> {selectedTask.traceabilityNotes}
                    </div>
                  )}
                </div>
              )}

              {selectedTask.pullRequests && selectedTask.pullRequests.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Linked Pull Requests</h3>
                  <div className="space-y-3">
                    {selectedTask.pullRequests.map((pr) => {
                      const bgMap: Record<string, string> = {
                        PENDING: "bg-gray-100 text-gray-700",
                        APPROVED: "bg-green-100 text-green-700",
                        NEEDS_FIX: "bg-red-100 text-red-700",
                        AWAITING_TASK_LINK: "bg-yellow-100 text-yellow-700",
                      };
                      const statusColor = bgMap[pr.reviewStatus] || bgMap.PENDING;

                      return (
                        <div key={pr.id} className="p-4 border rounded-xl shadow-sm bg-white flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              #{pr.number}: {pr.title}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded uppercase ${statusColor}`}>
                                {pr.reviewStatus.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`/projects/${projectId}/pull-requests/${pr.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            View Audit Log
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
