"use client";

import { ChevronDown, Zap, CheckCircle2, RefreshCw, Check, Loader2 } from "lucide-react";
import React from "react";
import { trpc } from "../../../../../trpc/client";

export default function PRReviewPage({ params }: { params: Promise<{ workspaceId: string, prId: string }> }) {
  const { workspaceId, prId } = React.use(params);
  const { data: pr, isLoading, isError } = trpc.pullRequest.getById.useQuery({ id: prId });

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-[#0A0D14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#71717a] animate-spin" />
      </div>
    );
  }

  if (isError || !pr) {
    return (
      <div className="flex-1 h-full bg-[#0A0D14] flex items-center justify-center text-white">
        Failed to load Pull Request.
      </div>
    );
  }

  const latestRun = pr.reviewRuns?.[0];
  const issues = latestRun?.issues || [];

  const blockingIssues = issues.filter((i) => i.isBlocking);
  const nonBlockingIssues = issues.filter((i) => !i.isBlocking);


  // We'll extract a simple diff view from the issues. We don't have the full diff,
  // but we can render the snippets provided by the AI Review.
  const uniqueFiles = Array.from(new Set(issues.map((i) => i.filePath)));

  return (
    <div className="flex flex-col h-full bg-[#0A0D14] overflow-hidden">
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#27272a]/50 shrink-0">
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
          <span className="text-[#a1a1aa]">PR #{pr.number}</span>
        </div>
        <h1 className="text-[24px] font-bold text-white tracking-tight leading-tight mb-4">
          PR #{pr.number} — {pr.title}
        </h1>
        
        <div className="flex items-center gap-4 text-[13px]">
          <span className="text-[#a1a1aa]">{pr.repository.fullName}</span>
          <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 font-semibold text-[11px]">
            {pr.state}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
              {pr.authorLogin.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-white/90 font-medium">{pr.authorLogin}</span>
            <span className="text-[#71717a]">created {new Date(pr.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <span className="text-red-400 font-bold">{blockingIssues.length} Blocking</span>
            <span className="text-amber-400 font-bold">{nonBlockingIssues.length} Non-blocking</span>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Code Diff (Snippets) */}
        <div className="flex-1 border-r border-[#27272a]/50 flex flex-col bg-[#0A0D14] overflow-hidden">
          {uniqueFiles.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#71717a] text-[14px]">
              No issues found, so no snippets to display.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-[#0A0D14] font-mono text-[13px] leading-[1.6]">
              {uniqueFiles.map((file) => (
                <div key={file} className="mb-8">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#13161F] border-y border-[#27272a]/50 shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-[#a1a1aa] text-[13px] font-mono">
                      <ChevronDown className="w-4 h-4" />
                      {file}
                    </div>
                  </div>
                  <div className="py-4">
                    {issues.filter(i => i.filePath === file).map(issue => (
                      <div key={issue.id} className="mb-6 px-4">
                        <div className="text-[11px] text-[#71717a] mb-2 font-sans px-4">
                          Snippet context for {issue.category} issue
                        </div>
                        {issue.snippet.split('\n').map((line, idx) => (
                          <DiffRow key={idx} text={line} type={line.startsWith('+') ? 'add' : line.startsWith('-') ? 'remove' : 'none'} empty={false} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Review Comments */}
        <div className="w-[480px] flex-shrink-0 flex flex-col bg-[#13161F] relative">
          
          <div className="px-6 py-4 border-b border-[#27272a]/50 flex items-center justify-between shrink-0 bg-[#13161F] z-10">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
              <h2 className="text-[15px] font-bold text-white">AI Review Comments</h2>
              <span className="px-1.5 py-0.5 bg-white/[0.05] text-[#a1a1aa] rounded text-[11px] font-bold">{issues.length}</span>
            </div>
            {latestRun && (
              <span className="text-[12px] text-[#71717a]">
                Latest Run: {new Date(latestRun.createdAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
            {issues.length === 0 ? (
              <div className="text-[#71717a] text-[13px]">No review comments for this PR.</div>
            ) : (
              issues.map(issue => (
                <CommentCard 
                  key={issue.id}
                  severity={issue.isBlocking ? "BLOCKING" : "NON-BLOCKING"} 
                  category={issue.category}
                  text={issue.comment}
                  line={issue.filePath}
                />
              ))
            )}
          </div>

          {/* Sticky Action Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#13161F] border-t border-[#27272a]/50">
            <div className="flex items-center gap-4 mb-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#27272a]/50 text-[#71717a] rounded-lg text-[14px] font-bold cursor-not-allowed">
                <CheckCircle2 className="w-4 h-4" />
                Request Human Approval
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white/[0.03] border border-[#27272a] transition-colors text-white rounded-lg text-[14px] font-bold shrink-0">
                <RefreshCw className="w-4 h-4" />
                Re-run AI Review
              </button>
            </div>
            {blockingIssues.length > 0 && (
              <p className="text-[12px] text-[#71717a]">Resolve all blocking issues first</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function DiffRow({ 
  numL, 
  numR, 
  text, 
  type = "none",
  empty = false,
  annotation = null
}: { 
  numL?: number, 
  numR?: number, 
  text?: string, 
  type?: "none" | "add" | "remove",
  empty?: boolean,
  annotation?: "blocking" | "non-blocking" | "resolved" | null
}) {
  let bgClass = "bg-transparent";
  let textClass = "text-[#a1a1aa]";
  
  if (type === "add") {
    bgClass = "bg-emerald-500/[0.15]";
    textClass = "text-emerald-400";
  } else if (type === "remove") {
    bgClass = "bg-red-500/[0.15]";
    textClass = "text-red-400";
  }

  let annotDot = null;
  if (annotation === "blocking") annotDot = <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-red-500 uppercase">Blocking</span></div>;
  if (annotation === "non-blocking") annotDot = <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] font-bold text-amber-500 uppercase">Non-blocking</span></div>;
  if (annotation === "resolved") annotDot = <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-emerald-500 uppercase">Resolved</span></div>;

  return (
    <div className={`flex w-full ${bgClass} hover:bg-white/[0.02] transition-colors relative group`}>
      <div className="w-12 shrink-0 border-r border-[#27272a]/30 text-right pr-2 text-[#52525b] select-none py-0.5">
        {empty ? "" : numL || "\u00A0"}
      </div>
      <div className="w-12 shrink-0 border-r border-[#27272a]/30 text-right pr-2 text-[#52525b] select-none py-0.5">
        {empty ? "" : numR || "\u00A0"}
      </div>
      <div className={`flex-1 pl-4 py-0.5 whitespace-pre ${textClass}`}>
        {empty ? "" : text}
      </div>
      {annotDot}
    </div>
  );
}

function CommentCard({
  severity,
  category,
  categoryColor = "text-red-500",
  categoryBg = "bg-transparent",
  text,
  line,
  resolved = false
}: {
  severity: "BLOCKING" | "NON-BLOCKING" | "RESOLVED";
  category: string;
  categoryColor?: string;
  categoryBg?: string;
  text: React.ReactNode;
  line: string;
  resolved?: boolean;
}) {
  
  let severityColor = "text-red-500";
  if (severity === "NON-BLOCKING") {
    severityColor = "text-amber-500";
    categoryColor = "text-amber-500";
  }
  if (severity === "RESOLVED") {
    severityColor = "text-emerald-500";
    categoryColor = "text-[#71717a]";
  }

  return (
    <div className={`bg-[#0A0D14] rounded-xl p-5 border ${resolved ? 'border-[#27272a]/30 opacity-70' : 'border-[#27272a]/50'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-bold tracking-widest ${severityColor}`}>
          {severity}
        </span>
        <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded ${categoryColor} ${categoryBg}`}>
          {category}
        </span>
      </div>
      
      <p className="text-[13px] text-white/90 leading-relaxed mb-4">
        {text}
      </p>
      
      <div className="text-[11px] text-[#71717a] font-mono">
        {line}
      </div>

      {resolved && (
        <div className="mt-4 pt-3 border-t border-[#27272a]/50 flex items-center gap-1.5 text-emerald-500 text-[12px] font-medium">
          <Check className="w-3.5 h-3.5" />
          Resolved
        </div>
      )}
    </div>
  );
}
