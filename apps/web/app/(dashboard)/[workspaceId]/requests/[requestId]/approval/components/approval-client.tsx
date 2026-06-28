"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, XCircle, Check, ArrowRight, X, ExternalLink, GitMerge, AlertCircle, Clock } from "lucide-react";
import { trpc } from "../../../../../../../trpc/client";
import { useRouter } from "next/navigation";

function ProgressPill({ label, state }: { label: string, state: "done" | "active" | "pending" }) {
  let styles = "";
  if (state === "done") {
    styles = "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
  } else if (state === "active") {
    styles = "bg-blue-600 border-blue-600 text-white";
  } else {
    styles = "bg-white/[0.02] border-[#27272a]/50 text-[#71717a]";
  }

  return (
    <div className={`px-2.5 py-1 rounded border text-[10px] font-bold tracking-widest shrink-0 ${styles}`}>
      {label}
    </div>
  );
}

function AcItem({ text, satisfied }: { text: string, satisfied?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      {satisfied ? (
        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <div className="w-4 h-4 border border-[#52525b] rounded-full shrink-0 mt-0.5" />
      )}
      <span className={`text-[14px] ${satisfied ? 'text-[#a1a1aa]' : 'text-[#71717a]'}`}>{text}</span>
    </li>
  );
}

function CollapsibleBlock({ 
  title, 
  headerExtra, 
  children, 
  defaultExpanded = true 
}: { 
  title: string, 
  headerExtra?: React.ReactNode, 
  children: React.ReactNode,
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-hidden transition-all">
      <div 
        onClick={() => setExpanded(!expanded)}
        className={`p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors ${expanded ? 'border-b border-[#27272a]/50' : ''}`}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-[16px] font-bold text-white">{title}</h2>
          {headerExtra}
        </div>
        {expanded ? <ChevronDown className="w-5 h-5 text-[#71717a]" /> : <ChevronRight className="w-5 h-5 text-[#71717a]" />}
      </div>
      {expanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}

export function ApprovalClient({ 
  featureRequest, 
  userName, 
  userRole 
}: { 
  featureRequest: any,
  userName: string,
  userRole: string
}) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const utils = trpc.useUtils();
  
  const shipFeatureMutation = trpc.featureRequest.shipFeature.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
      utils.featureRequest.getById.invalidate({ id: featureRequest.id });
    },
    onError: (err: any) => {
      console.error(err);
      setIsSubmitting(false);
      alert("Failed to ship feature: " + err.message);
    }
  });

  const requestRevisionsMutation = trpc.featureRequest.requestRevisions.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
      setIsRejectModalOpen(false);
      utils.featureRequest.getById.invalidate({ id: featureRequest.id });
    },
    onError: (err: any) => {
      console.error(err);
      setIsSubmitting(false);
      alert("Failed to request revisions: " + err.message);
    }
  });

  const handleShip = async () => {
    setIsSubmitting(true);
    await shipFeatureMutation.mutateAsync({
      id: featureRequest.id
    });
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert("A reason is mandatory for rejection.");
      return;
    }
    
    setIsSubmitting(true);
    await requestRevisionsMutation.mutateAsync({
      id: featureRequest.id,
      reason: rejectReason.trim(),
    });
  };

  // Stats calculation
  const totalTasks = featureRequest.tasks.length;
  const doneTasks = featureRequest.tasks.filter((t: any) => t.status === "DONE");
  const doneTasksCount = doneTasks.length;
  const inProgressTasksCount = featureRequest.tasks.filter((t: any) => t.status === "IN_PROGRESS").length;
  const todoTasksCount = totalTasks - doneTasksCount - inProgressTasksCount;

  // Aggregate genuine satisfied Acceptance Criteria from all DONE tasks
  const aggregatedSatisfiedAC = doneTasks.flatMap((t: any) => t.satisfiedAcceptanceCriteria || []);

  // PR fetching (from Tasks)
  const allPrs = featureRequest.tasks.flatMap((t: any) => t.pullRequests || []);
  // Deduplicate PRs by id
  const uniquePrs = Array.from(new Map(allPrs.map((pr: any) => [pr.id, pr])).values()) as any[];
  
  const allChecksPassed = doneTasksCount === totalTasks && uniquePrs.every((pr: any) => pr.reviewStatus === "APPROVED");

  return (
    <div className="flex-1 h-full bg-[#0A0D14] overflow-y-auto relative">
      <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 pb-48">
        
        {/* Header */}
        <div className="mb-6">
          <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
            <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
            <span className="text-[10px]">&gt;</span>
            <span className="hover:text-white cursor-pointer transition-colors max-w-[250px] truncate">{featureRequest.title}</span>
            <span className="text-[10px]">&gt;</span>
            <span className="text-[#a1a1aa]">Final Approval</span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            Final Approval
          </h1>
        </div>

        {/* Success Banner */}
        {featureRequest.status === "SHIPPED" ? (
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-8">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            <span className="text-blue-500 font-bold text-[15px]">This feature has been shipped</span>
          </div>
        ) : allChecksPassed ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-8">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500 font-bold text-[15px]">All checks passed — ready for approval</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-8">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-bold text-[15px]">There are pending tasks or PRs that need review.</span>
          </div>
        )}

        {/* Progress Track */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          <ProgressPill label="REQUEST" state="done" />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="PRD" state="done" />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="TASKS" state="done" />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="CODE" state="done" />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="AI REVIEW" state="done" />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="FIXES" state="done" />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="HUMAN APPROVAL" state={featureRequest.status === "SHIPPED" ? "done" : "active"} />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="SHIPPED" state={featureRequest.status === "SHIPPED" ? "done" : "pending"} />
        </div>

        {/* Collapsible Blocks */}
        <div className="space-y-4">
          
          <CollapsibleBlock title="PRD Summary">
            <h3 className="text-[15px] font-bold text-white mb-2">{featureRequest.title}</h3>
            <p className="text-[14px] text-[#a1a1aa] leading-relaxed mb-6">
              {featureRequest.prd?.problemStatement || featureRequest.content}
            </p>
            
            {featureRequest.prd?.goals?.length > 0 && (
              <>
                <h4 className="text-[14px] font-bold text-white mb-3">Goals</h4>
                <ul className="list-disc list-inside space-y-2 text-[14px] text-[#a1a1aa] mb-6 ml-1">
                  {featureRequest.prd.goals.map((goal: string, idx: number) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </>
            )}
            
            {featureRequest.prd?.acceptanceCriteria?.length > 0 && (
              <>
                <h4 className="text-[14px] font-bold text-white mb-3">Acceptance Criteria</h4>
                <ul className="space-y-2.5 mb-6">
                  {featureRequest.prd.acceptanceCriteria.map((ac: string, idx: number) => {
                    const satisfied = aggregatedSatisfiedAC.includes(ac);
                    return <AcItem key={idx} text={ac} satisfied={satisfied} />
                  })}
                </ul>
              </>
            )}
          </CollapsibleBlock>

          <CollapsibleBlock 
            title="Task Completion" 
            headerExtra={
              <div className="flex gap-3 text-[13px] text-[#71717a] font-medium">
                <span>To Do: <strong className="text-[#a1a1aa]">{todoTasksCount}</strong></span>
                <span>In Progress: <strong className="text-[#a1a1aa]">{inProgressTasksCount}</strong></span>
                <span>Done: <strong className="text-[#a1a1aa]">{doneTasksCount}</strong></span>
              </div>
            }
          >
            <div className={`text-[14px] font-bold mb-4 ${doneTasksCount === totalTasks ? 'text-emerald-500' : 'text-amber-500'}`}>
              {doneTasksCount}/{totalTasks} tasks completed
            </div>
            <ul className="space-y-3">
              {featureRequest.tasks.map((task: any) => (
                <AcItem key={task.id} text={task.title} satisfied={task.status === "DONE"} />
              ))}
            </ul>
          </CollapsibleBlock>

          <CollapsibleBlock title="PR Status" defaultExpanded={true}>
            {uniquePrs.length === 0 ? (
              <p className="text-[14px] text-[#a1a1aa]">No Pull Requests linked to the tasks yet.</p>
            ) : (
              <div className="space-y-4">
                {uniquePrs.map((pr: any) => {
                  const latestRun = pr.reviewRuns?.[0];
                  
                  return (
                    <div key={pr.id} className="bg-[#1A1E29] border border-[#27272a] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <a href={pr.url} target="_blank" rel="noreferrer" className="text-[15px] font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <GitMerge className="w-4 h-4" />
                            {pr.title} <span className="text-[#71717a] font-normal">#{pr.number}</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#71717a]" />
                          </a>
                          <div className="text-[13px] text-[#71717a] mt-1 flex items-center gap-2">
                            <span>by {pr.authorLogin}</span>
                            <span>•</span>
                            <span className="uppercase text-[11px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-white/[0.05]">{pr.state}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {pr.reviewStatus === "APPROVED" && (
                            <span className="flex items-center gap-1.5 text-emerald-500 text-[13px] font-bold bg-emerald-500/10 px-2 py-1 rounded">
                              <CheckCircle2 className="w-4 h-4" /> APPROVED
                            </span>
                          )}
                          {pr.reviewStatus === "NEEDS_FIX" && (
                            <span className="flex items-center gap-1.5 text-red-500 text-[13px] font-bold bg-red-500/10 px-2 py-1 rounded">
                              <XCircle className="w-4 h-4" /> NEEDS FIX
                            </span>
                          )}
                          {pr.reviewStatus === "PENDING" && (
                            <span className="flex items-center gap-1.5 text-amber-500 text-[13px] font-bold bg-amber-500/10 px-2 py-1 rounded">
                              <Clock className="w-4 h-4" /> REVIEWING
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {latestRun && (
                        <div className="bg-[#13161F] border border-[#27272a]/50 rounded-md p-3 text-[13px]">
                          <p className="text-[#a1a1aa] whitespace-pre-line font-mono text-[12px]">{latestRun.summary}</p>
                          {latestRun.issues?.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="font-bold text-white text-[12px] uppercase tracking-widest">Issues Found</div>
                              {latestRun.issues.map((issue: any) => (
                                <div key={issue.id} className="flex items-start gap-2 text-[#a1a1aa]">
                                  {issue.isBlocking ? <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                                  <div>
                                    <span className="font-bold text-white">{issue.filePath}:</span> {issue.comment}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleBlock>

        </div>

      </div>

      {/* Sticky Action Footer */}
      {featureRequest.status !== "SHIPPED" && (
        <div className="fixed bottom-0 left-[260px] right-0 bg-[#0A0D14] border-t border-[#27272a]/50 p-6 z-10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-white/90">Approving as {userName}</span>
            <span className="text-[13px] text-[#71717a]">({userRole})</span>
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <input 
              type="text" 
              placeholder="Add approval notes (optional)..." 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#1A1E29] border border-[#27272a] rounded-lg px-4 py-2.5 text-[14px] text-white placeholder-[#52525b] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-4 shrink-0 relative">
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors text-[14px] font-bold rounded-lg disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <span className="absolute -bottom-5 text-[11px] text-[#71717a] italic">Rejection requires a reason.</span>
            </div>
            <button 
              onClick={handleShip}
              disabled={isSubmitting || !allChecksPassed}
              className={`flex items-center gap-2 px-6 py-2.5 transition-colors text-white text-[14px] font-bold rounded-lg shadow-sm ${allChecksPassed && !isSubmitting ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-[#27272a] text-[#a1a1aa] cursor-not-allowed'}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Updating..." : "Approve & Ship"}
            </button>
          </div>
        </div>
      )}

      {/* Rejection Modal Overlay */}
      {isRejectModalOpen && (
        <form onSubmit={handleRejectSubmit} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-white">Reason for rejection</h2>
              <button 
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="text-[#71717a] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea 
              rows={4}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection"
              className="w-full bg-[#1A1E29] border border-[#27272a] rounded-lg p-4 text-[14px] text-white placeholder-[#52525b] focus:outline-none focus:border-red-500 transition-colors mb-6 resize-none"
            />
            
            <button 
              type="submit"
              disabled={isSubmitting || !rejectReason.trim()}
              className="w-full py-3 bg-red-600 hover:bg-red-500 transition-colors text-white text-[14px] font-bold rounded-xl shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Returning..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
