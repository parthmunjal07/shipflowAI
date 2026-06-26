"use client";

import React, { useState } from "react";
import { CheckCircle2, ChevronDown, XCircle, Check, ArrowRight, X } from "lucide-react";

export default function FinalApprovalPage() {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  return (
    <div className="flex-1 h-full bg-[#0A0D14] overflow-y-auto relative">
      <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 pb-48">
        
        {/* Header */}
        <div className="mb-6">
          <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
            <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
            <span className="text-[10px]">&gt;</span>
            <span className="hover:text-white cursor-pointer transition-colors">Add CSV export to reports</span>
            <span className="text-[10px]">&gt;</span>
            <span className="text-[#a1a1aa]">Final Approval</span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            Final Approval
          </h1>
        </div>

        {/* Success Banner */}
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-8">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-500 font-bold text-[15px]">All checks passed — ready for approval</span>
        </div>

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
          <ProgressPill label="HUMAN APPROVAL" state="active" />
          <ArrowRight className="w-3 h-3 text-[#52525b] shrink-0" />
          <ProgressPill label="SHIPPED" state="pending" />
        </div>

        {/* Collapsible Blocks */}
        <div className="space-y-4">
          
          {/* PRD Summary Block (Expanded) */}
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-[#27272a]/50">
              <h2 className="text-[16px] font-bold text-white">PRD Summary</h2>
              <ChevronDown className="w-5 h-5 text-[#71717a]" />
            </div>
            <div className="p-6">
              <h3 className="text-[15px] font-bold text-white mb-2">Add CSV export to reports</h3>
              <p className="text-[14px] text-[#a1a1aa] leading-relaxed mb-6">
                Enterprise customers are unable to export report data for use in external BI tools. This creates a manual data extraction bottleneck and is cited as a blocker by 6 active enterprise accounts.
              </p>
              
              <h4 className="text-[14px] font-bold text-white mb-3">Goals</h4>
              <ul className="list-disc list-inside space-y-2 text-[14px] text-[#a1a1aa] mb-6 ml-1">
                <li>Enable CSV export from any report view</li>
                <li>Support streaming export for datasets over 10k rows</li>
                <li>Respect active filter state at time of export</li>
              </ul>
              
              <h4 className="text-[14px] font-bold text-white mb-3">Acceptance Criteria</h4>
              <ul className="space-y-2.5 mb-6">
                <AcItem text="Export button appears on all report views" />
                <AcItem text="Clicking Export opens a confirmation modal with row count" />
                <AcItem text="Export respects all active filters and sort orders" />
                <AcItem text="Exports over 10k rows are streamed to prevent timeouts" />
                <AcItem text="Free plan exports capped at 1,000 rows" />
              </ul>
              
              <a href="#" className="text-[14px] font-medium text-blue-500 hover:text-blue-400 transition-colors">
                View full PRD →
              </a>
            </div>
          </div>

          {/* Task Completion Block (Expanded) */}
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-[#27272a]/50">
              <div className="flex items-center gap-4">
                <h2 className="text-[16px] font-bold text-white">Task Completion</h2>
                <div className="flex gap-3 text-[13px] text-[#71717a] font-medium">
                  <span>To Do: <strong className="text-[#a1a1aa]">0</strong></span>
                  <span>In Progress: <strong className="text-[#a1a1aa]">0</strong></span>
                  <span>Done: <strong className="text-[#a1a1aa]">8</strong></span>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-[#71717a]" />
            </div>
            <div className="p-6">
              <div className="text-[14px] font-bold text-emerald-500 mb-4">
                8/8 tasks completed
              </div>
              <ul className="space-y-3">
                <AcItem text="Implement CSV export endpoint" />
                <AcItem text="Add export button to report views" />
                <AcItem text="Handle large dataset streaming" />
                <AcItem text="Add confirmation modal with row count" />
              </ul>
            </div>
          </div>

          {/* PR Status Block (Collapsed) */}
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors">
              <h2 className="text-[16px] font-bold text-white">PR Status</h2>
              <ChevronDown className="w-5 h-5 text-[#71717a]" />
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-[260px] right-0 bg-[#0A0D14] border-t border-[#27272a]/50 p-6 z-10 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-white/90">Approving as Jordan Lee</span>
          <span className="text-[13px] text-[#71717a]">(Eng Manager)</span>
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <input 
            type="text" 
            placeholder="Add approval notes (optional)..." 
            className="w-full bg-[#1A1E29] border border-[#27272a] rounded-lg px-4 py-2.5 text-[14px] text-white placeholder-[#52525b] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-4 shrink-0 relative">
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setIsRejectModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors text-[14px] font-bold rounded-lg"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <span className="absolute -bottom-5 text-[11px] text-[#71717a] italic">Rejection requires a reason.</span>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-[14px] font-bold rounded-lg shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            Approve & Ship
          </button>
        </div>
      </div>

      {/* Rejection Modal Overlay */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-white">Reason for rejection</h2>
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="text-[#71717a] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea 
              rows={4}
              placeholder="Reason for rejection"
              className="w-full bg-[#1A1E29] border border-[#27272a] rounded-lg p-4 text-[14px] text-white placeholder-[#52525b] focus:outline-none focus:border-red-500 transition-colors mb-6 resize-none"
            />
            
            <button 
              onClick={() => setIsRejectModalOpen(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-500 transition-colors text-white text-[14px] font-bold rounded-xl shadow-sm"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable Progress Pill Component
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

// Reusable AC Item Component
function AcItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      <span className="text-[14px] text-[#a1a1aa]">{text}</span>
    </li>
  );
}
