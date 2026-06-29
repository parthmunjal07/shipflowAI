"use client";

import { Eye, Check, Loader2 } from "lucide-react";
import React from "react";
import { trpc } from "../../../../../../trpc/client";

export default function ReviewHistoryPage({ params }: { params: Promise<{ workspaceId: string, prId: string }> }) {
  const { workspaceId, prId } = React.use(params);
  const { data: pr, isLoading, isError } = trpc.pullRequest.getHistory.useQuery({ id: prId });

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-surface-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#71717a] animate-spin" />
      </div>
    );
  }

  if (isError || !pr) {
    return (
      <div className="flex-1 h-full bg-surface-base flex items-center justify-center text-white">
        Failed to load Pull Request History.
      </div>
    );
  }

  const reviewRuns = pr.reviewRuns || [];
  
  // Stats calculations
  const totalPasses = reviewRuns.length;
  let totalIssuesFound = 0;
  let totalIssuesResolved = 0;
  
  if (totalPasses > 0) {
    const firstRunIssues = reviewRuns[0]?.issues?.length || 0;
    const latestRunIssues = reviewRuns[totalPasses - 1]?.issues?.length || 0;
    totalIssuesFound = reviewRuns.reduce((acc, run) => Math.max(acc, run.issues.length), 0);
    totalIssuesResolved = Math.max(0, totalIssuesFound - latestRunIssues);
  }

  return (
    <div className="flex-1 h-full bg-surface-base overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 pb-32">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
              {pr.tasks?.[0]?.featureRequest ? (
                <>
                  <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
                  <span className="text-[10px]">&gt;</span>
                  <span className="hover:text-white cursor-pointer transition-colors truncate max-w-[200px]">
                    {pr.tasks[0].featureRequest.title}
                  </span>
                  <span className="text-[10px]">&gt;</span>
                </>
              ) : (
                <>
                  <span className="hover:text-white cursor-pointer transition-colors">Pull Requests</span>
                  <span className="text-[10px]">&gt;</span>
                </>
              )}
              <span className="hover:text-white cursor-pointer transition-colors">PR #{pr.number}</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa]">Review History</span>
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-2">
              Review History — PR #{pr.number}
            </h1>
            <div className="text-[13px] font-mono text-[#a1a1aa]">
              {pr.title} · {pr.repository.fullName}
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-mint hover:bg-brand-mintHover text-brand-dark font-bold transition-colors text-white text-[13px] font-bold rounded-lg shadow-sm shrink-0">
            <Eye className="w-4 h-4" />
            Request Human Approval
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard title="REVIEW PASSES" value={totalPasses.toString()} valueColor="text-brand-mint" />
          <StatCard title="ISSUES FOUND" value={totalIssuesFound.toString()} valueColor="text-red-500" />
          <StatCard title="ISSUES RESOLVED" value={totalIssuesResolved.toString()} valueColor="text-emerald-500" />
        </div>

        {/* Timeline Container */}
        <div className="bg-surface-card border border-[#27272a]/50 rounded-2xl p-8 mb-8 relative">
          
          {reviewRuns.length > 1 && (
            <div className="absolute top-[4.5rem] bottom-12 left-[41px] w-px bg-[#27272a]/50"></div>
          )}

          <div className="space-y-12 relative z-10">
            {reviewRuns.length === 0 ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#27272a]/50 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-[#71717a]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-1">No review history yet</h3>
                  <p className="text-[14px] text-[#a1a1aa] mb-3">AI review will appear here after the first push to the linked branch.</p>
                  <a href={pr.url} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-brand-mint hover:text-brand-mint transition-colors">
                    View PR on GitHub →
                  </a>
                </div>
              </div>
            ) : (
              reviewRuns.map((run, index) => {
                const passNumber = index + 1;
                const isLatest = index === reviewRuns.length - 1;
                const isAllResolved = isLatest && run.issues.length === 0 && totalIssuesFound > 0;
                
                let dotColorClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
                if (isLatest) {
                  if (run.issues.length === 0) dotColorClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                  else dotColorClass = "bg-brand-mint text-brand-dark font-bold shadow-[0_0_8px_rgba(59,130,246,0.5)]";
                }

                // Group issues by category for the chart
                const categoryCounts: Record<string, number> = {};
                run.issues.forEach(i => {
                  categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
                });

                return (
                  <div key={run.id} className="flex gap-6">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${dotColorClass}`}></div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-white mb-1">Pass {passNumber} · AI Review</h3>
                      <p className="text-[13px] text-[#71717a] mb-4">
                        {new Date(run.createdAt).toLocaleString()} · triggered by push to {run.headSha ? run.headSha.substring(0, 7) : "branch"}
                      </p>
                      
                      <div className="bg-surface-elevated rounded-xl border border-[#27272a]/50 p-6">
                        {Object.keys(categoryCounts).length > 0 ? (
                          <>
                            <div className="flex items-end gap-6 h-24 mb-6 border-b border-[#27272a]/50 pb-2 overflow-x-auto">
                              {Object.entries(categoryCounts).map(([cat, count]) => {
                                const bars = Array.from({ length: count }).map(() => ({ h: "h-10", c: "bg-amber-500" }));
                                return <ChartGroup key={cat} label={`${cat} ${count}`} bars={bars} />;
                              })}
                            </div>
                            
                            {isLatest && !isAllResolved ? (
                              <div className="flex items-center justify-between text-[13px] font-medium">
                                <span className="text-emerald-500">Progress: {totalIssuesResolved} of {totalIssuesFound} resolved</span>
                                <span className="text-[#71717a]">{run.issues.length} remaining</span>
                              </div>
                            ) : (
                              <ul className="space-y-1.5 text-[13px] text-[#a1a1aa] list-disc list-inside ml-2">
                                {run.issues.slice(0, 5).map(issue => (
                                  <li key={issue.id}>{issue.comment.substring(0, 80)}...</li>
                                ))}
                                {run.issues.length > 5 && <li>And {run.issues.length - 5} more...</li>}
                              </ul>
                            )}
                          </>
                        ) : (
                          <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-[13px] font-bold text-emerald-500">
                            <Check className="w-4 h-4" />
                            All issues resolved — ready for human approval
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, valueColor }: { title: string, value: string, valueColor: string }) {
  return (
    <div className="bg-surface-card border border-[#27272a]/50 rounded-xl p-5">
      <h3 className="text-[11px] font-bold text-[#71717a] tracking-[0.2em] mb-2 uppercase">{title}</h3>
      <div className={`text-[32px] font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}

// Reusable Bar Chart Group Component
function ChartGroup({ label, bars }: { label: string, bars: { h: string, c: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <div className="flex items-end gap-1.5 h-12">
        {bars.map((bar, i) => (
          <div key={i} className={`w-4 rounded-sm ${bar.h} ${bar.c}`}></div>
        ))}
      </div>
      <span className="text-[10px] text-[#71717a] font-medium truncate max-w-[80px] text-center" title={label}>{label}</span>
    </div>
  );
}
