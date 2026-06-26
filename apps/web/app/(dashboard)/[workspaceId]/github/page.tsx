"use client";

import React from "react";
import { GitBranch, Plus } from "lucide-react";

export default function GitHubIntegrationPage() {
  return (
    <div className="flex-1 h-full bg-[#0A0D14] flex overflow-hidden">
      
      {/* Left Column - Integration Settings */}
      <div className="flex-1 overflow-y-auto border-r border-[#27272a]/50 p-8 lg:p-12">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="mb-10">
            <div className="text-[13px] text-[#71717a] mb-6 flex items-center gap-1.5">
              <span className="hover:text-white cursor-pointer transition-colors">Integrations</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa]">GitHub</span>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#1A1E29] border border-[#27272a] flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight mb-2">
                  GitHub Integration
                </h1>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md text-[11px] font-bold tracking-wide">
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Connected Repositories */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-white">Connected Repositories (3)</h2>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-bold rounded-lg shadow-sm">
                <Plus className="w-4 h-4" />
                Install New Repo
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              <RepoCard name="acmecorp/reports-service" branch="main" time="12 min ago" />
              <RepoCard name="acmecorp/auth-service" branch="main" time="28 min ago" />
              <RepoCard name="acmecorp/api-gateway" branch="main" time="1h ago" />
            </div>
            
            <button className="w-full py-4 border border-dashed border-[#27272a] hover:border-[#52525b] hover:bg-white/[0.02] rounded-xl flex items-center justify-center gap-2 text-[14px] text-[#71717a] font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Connect another repository
            </button>
          </div>

          {/* Recent Pull Requests */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-white">Recent Pull Requests</h2>
              <span className="text-[13px] text-[#71717a]">5 latest</span>
            </div>
            
            <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#27272a]/50 bg-[#1A1E29]/30 whitespace-nowrap">
                    <th className="px-5 py-3 text-[11px] font-bold text-[#71717a] tracking-widest">PR</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#71717a] tracking-widest">TITLE</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#71717a] tracking-widest">REPO</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#71717a] tracking-widest">STATUS</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#71717a] tracking-widest">AI REVIEW</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]/50">
                  <PrRow pr="#142" title="feat: add CSV export endpoint" repo="reports-service" status="Open" review="Reviewed" />
                  <PrRow pr="#141" title="feat: SSO login enterprise" repo="auth-service" status="Merged" review="Reviewed" />
                  <PrRow pr="#140" title="fix: pagination bug reports table" repo="reports-service" status="Closed" review="Pending" />
                  <PrRow pr="#139" title="feat: webhook retry logic" repo="api-gateway" status="Open" review="Not Started" />
                  <PrRow pr="#138" title="feat: audit log export" repo="auth-service" status="Merged" review="Reviewed" />
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Right Column - PR Detail (Split View) */}
      <div className="w-[550px] shrink-0 bg-[#0A0D14] flex flex-col h-full border-l border-[#27272a]/50">
        
        {/* Detail Header */}
        <div className="p-6 pb-0 border-b border-[#27272a]/50">
          <div className="text-[13px] text-[#71717a] mb-2">PR #142</div>
          <h2 className="text-[20px] font-bold text-white leading-tight mb-3">feat: add CSV export endpoint</h2>
          <div className="flex items-center gap-2 text-[13px] mb-6">
            <span className="text-[#a1a1aa]">acmecorp/reports-service</span>
            <span className="text-[#52525b]">•</span>
            <span className="text-blue-500 font-medium">Open</span>
            <span className="text-[#52525b]">•</span>
            <div className="w-4 h-4 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0"></div>
            <span className="text-[#a1a1aa]">Marcus Webb</span>
            <span className="text-[#52525b]">•</span>
            <span className="text-[#71717a]">opened 2h ago</span>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-6">
            <button className="pb-3 text-[14px] font-bold text-white border-b-2 border-blue-500">
              Diff
            </button>
            <button className="pb-3 text-[14px] font-medium text-[#71717a] hover:text-[#a1a1aa] transition-colors border-b-2 border-transparent">
              Review Comments
            </button>
          </div>
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0A0D14]">
          <div className="text-[11px] font-bold text-[#71717a] tracking-[0.2em] mb-4">CODE DIFF</div>
          
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-hidden font-mono text-[13px] leading-relaxed">
            <DiffLine num="118" content="def export_csv(report_id):" type="removed" />
            <DiffLine num="119" content="rows = fetch_rows(report_id)" type="removed" />
            <DiffLine num="120" content="async def export_csv(report_id, stream: bool = True):" type="added" />
            <DiffLine num="121" content="rows = await fetch_rows(report_id, include_filters=True)" type="added" />
            <DiffLine num="122" content="if stream:" type="normal" />
            <DiffLine num="123" content="return Response(generate_csv(rows))" type="removed" />
            <DiffLine num="124" content="return StreamingResponse(generate_csv_stream(rows), media_type=&quot;text/csv&quot;)" type="added" indent={1} />
            <DiffLine num="125" content="return build_csv_response(rows)" type="normal" />
            <DiffLine num="126" content="# respects active filters and limits" type="added" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Repo Card Component
function RepoCard({ name, branch, time }: { name: string, branch: string, time: string }) {
  return (
    <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
          <GitBranch className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-white mb-0.5">{name}</h3>
          <p className="text-[13px] text-[#71717a]">
            Branch <span className="font-bold text-[#a1a1aa]">{branch}</span> · Synced {time}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[13px] font-bold text-emerald-500">Active</span>
        <button className="px-3 py-1.5 bg-transparent hover:bg-white/[0.04] transition-colors border border-[#27272a]/50 rounded-lg text-[13px] font-medium text-white">
          Manage
        </button>
      </div>
    </div>
  );
}

// Reusable PR Table Row
function PrRow({ pr, title, repo, status, review }: { pr: string, title: string, repo: string, status: string, review: string }) {
  let statusBadge = "";
  if (status === "Open") statusBadge = "bg-blue-600/10 text-blue-500 border border-blue-500/20";
  else if (status === "Merged") statusBadge = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
  else statusBadge = "bg-white/[0.05] text-[#a1a1aa] border border-[#27272a]";

  let reviewBadge = "";
  if (review === "Reviewed") reviewBadge = "text-emerald-500";
  else if (review === "Pending") reviewBadge = "bg-amber-500 text-amber-950 px-2 rounded-md"; // The mockup has orange text/badge
  else reviewBadge = "bg-white/[0.05] text-[#71717a] px-2 rounded-md";

  if(review === "Pending") {
    reviewBadge = "bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded";
  } else if (review === "Not Started") {
    reviewBadge = "bg-white/[0.05] text-[#71717a] border border-[#27272a]/50 px-2 py-0.5 rounded";
  } else {
    reviewBadge = "text-emerald-500 font-medium";
  }

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
      <td className="px-5 py-4 whitespace-nowrap">
        <span className="text-[14px] font-bold text-blue-500">{pr}</span>
      </td>
      <td className="px-5 py-4">
        <span className="text-[14px] font-medium text-white">{title}</span>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <span className="text-[13px] text-[#71717a]">{repo}</span>
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <span className={`px-2 py-0.5 rounded text-[12px] font-medium ${statusBadge}`}>
          {status}
        </span>
      </td>
      <td className="px-5 py-4 text-[13px] whitespace-nowrap">
        <span className={reviewBadge}>
          {review}
        </span>
      </td>
    </tr>
  );
}

// Reusable Diff Line
function DiffLine({ num, content, type, indent = 0 }: { num: string, content: string, type: "added" | "removed" | "normal", indent?: number }) {
  let bgClass = "bg-transparent";
  let textClass = "text-[#a1a1aa]";
  let symbol = " ";
  
  if (type === "added") {
    bgClass = "bg-emerald-500/10";
    textClass = "text-emerald-500";
    symbol = "+";
  } else if (type === "removed") {
    bgClass = "bg-red-500/10";
    textClass = "text-red-500";
    symbol = "-";
  }

  const paddingLeft = `${16 + (indent * 24)}px`;

  return (
    <div className={`flex w-full ${bgClass} ${textClass}`}>
      <div className="w-12 shrink-0 py-1 px-3 text-right select-none opacity-50 border-r border-[#27272a]/30">
        {num}
      </div>
      <div className="w-8 shrink-0 py-1 text-center select-none opacity-75">
        {symbol}
      </div>
      <div className="flex-1 py-1 pr-4 whitespace-pre-wrap" style={{ paddingLeft }}>
        {content}
      </div>
    </div>
  );
}
