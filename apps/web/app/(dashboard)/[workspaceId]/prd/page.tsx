"use client";

import { ArrowRight, ChevronDown, Download, Share, Bold, Italic, Link2, Plus, Sparkles } from "lucide-react";
import React from "react";

// Reusable Section Component
const PrdSection = ({ 
  title, 
  children, 
  isEmpty = false, 
  isActive = false 
}: { 
  title: string, 
  children: React.ReactNode, 
  isEmpty?: boolean,
  isActive?: boolean
}) => {
  return (
    <div className={`bg-[#13161F] border rounded-2xl p-6 relative group transition-colors ${isActive ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-[#27272a]/50 hover:border-[#27272a]'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-[#71717a] tracking-widest uppercase">
          {title}
        </h3>
        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[11px] font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
          AI suggest
        </button>
      </div>
      <div className="text-[14px] text-white/90 leading-relaxed">
        {children}
      </div>
      
      {/* Floating Toolbar for Active State */}
      {isActive && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1A1E29] border border-[#27272a] rounded-lg p-1 shadow-xl z-10">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#a1a1aa] hover:text-white hover:bg-white/[0.05] rounded-md transition-colors text-[12px] font-medium">
            <Bold className="w-3.5 h-3.5" /> Bold
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#a1a1aa] hover:text-white hover:bg-white/[0.05] rounded-md transition-colors text-[12px] font-medium">
            <Italic className="w-3.5 h-3.5" /> Italic
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#a1a1aa] hover:text-white hover:bg-white/[0.05] rounded-md transition-colors text-[12px] font-medium">
            <Link2 className="w-3.5 h-3.5" /> Link
          </button>
          <div className="w-px h-4 bg-[#27272a] mx-1"></div>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#a1a1aa] hover:text-white hover:bg-white/[0.05] rounded-md transition-colors text-[12px] font-medium">
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>
      )}
    </div>
  );
};

export default function PrdEditorPage() {
  return (
    <div className="flex-1 bg-[#0A0D14] h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 pb-32">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
              <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
              <span className="text-[10px]">&gt;</span>
              <span className="hover:text-white cursor-pointer transition-colors">Add CSV export to reports</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa]">PRD</span>
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-3">
              PRD: Add CSV export to reports
            </h1>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded border border-[#27272a] bg-white/[0.02] text-[#a1a1aa] font-medium text-[11px]">
                Draft
              </span>
              <span className="text-[13px] text-[#71717a]">
                Last edited by Jordan Lee - 5 min ago
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 ml-4 mt-2">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm">
                Generate Tasks
                <div className="w-px h-4 bg-blue-500/50 mx-0.5" />
                <ChevronDown className="w-4 h-4 -ml-1" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-white/[0.03] transition-colors text-white text-[13px] font-medium rounded-lg">
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-white/[0.03] transition-colors text-white text-[13px] font-medium rounded-lg">
              Share
            </button>
          </div>
        </div>

        {/* PRD Sections */}
        <div className="space-y-6">
          
          <PrdSection title="Problem Statement">
            <p>
              Enterprise customers are unable to export report data for use in external BI tools. This creates a manual data extraction bottleneck and is cited as a blocker by 6 active enterprise accounts.
            </p>
          </PrdSection>

          <PrdSection title="Goals">
            <ul className="list-disc pl-5 space-y-2 marker:text-[#52525b]">
              <li>Enable CSV export from any report view</li>
              <li>Support streaming export for datasets up to 500k rows</li>
              <li>Respect active filter state at time of export</li>
              <li>Configurable file size limits by plan tier</li>
            </ul>
          </PrdSection>

          <PrdSection title="Non-Goals">
            <ul className="list-disc pl-5 space-y-2 marker:text-[#52525b]">
              <li>Excel (.xlsx) format support (future milestone)</li>
              <li>Scheduled/automated exports</li>
              <li>Export of raw event logs</li>
            </ul>
          </PrdSection>

          <PrdSection title="User Stories">
            <div className="space-y-3">
              <div className="bg-[#1A1E29] rounded-xl p-4 border border-[#27272a]/30">
                <div className="text-[11px] text-[#71717a] font-medium mb-1.5">1</div>
                <p>As an enterprise user, I want to export filtered report data as a CSV so that I can import it into our internal BI dashboard.</p>
              </div>
              <div className="bg-[#1A1E29] rounded-xl p-4 border border-[#27272a]/30">
                <div className="text-[11px] text-[#71717a] font-medium mb-1.5">2</div>
                <p>As an admin, I want to configure per-plan export size limits so that we can enforce fair usage.</p>
              </div>
              <div className="bg-[#1A1E29] rounded-xl p-4 border border-[#27272a]/30">
                <div className="text-[11px] text-[#71717a] font-medium mb-1.5">3</div>
                <p>As a user, I want to preview the row count before confirming a large export so that I avoid accidental large downloads.</p>
              </div>
            </div>
          </PrdSection>

          <PrdSection title="Acceptance Criteria" isActive={true}>
            <ul className="list-disc pl-5 space-y-2 marker:text-[#52525b]">
              <li>Export button appears on all report views for users with export permission.</li>
              <li>Clicking Export opens a confirmation modal showing row count and estimated file size.</li>
              <li>Export respects all active filters.</li>
              <li>Exports over 10k rows are streamed; progress indicator shown.<span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse align-middle ml-1"></span></li>
              <li>Free plan exports capped at 10MB; enterprise plans uncapped.</li>
              <li>PII fields (email, phone) masked by default unless admin overrides.</li>
            </ul>
          </PrdSection>

          <PrdSection title="Edge Cases">
            <ul className="list-disc pl-5 space-y-2 marker:text-[#52525b]">
              <li>Empty dataset: show informative message, disable export button</li>
              <li>Export interrupted mid-stream: partial file discarded, error shown</li>
              <li>Concurrent exports by same user: queue second request</li>
            </ul>
          </PrdSection>

          <PrdSection title="Success Metrics">
            <ul className="list-disc pl-5 space-y-2 marker:text-[#52525b]">
              <li>80% of enterprise accounts use export within 30 days of launch</li>
              <li>Zero data integrity complaints in first 90 days</li>
              <li>Export p95 latency under 2s for datasets up to 100k rows</li>
            </ul>
          </PrdSection>

          {/* Empty Section */}
          <div className="bg-[#13161F] border border-dashed border-[#27272a] hover:border-[#52525b] transition-colors rounded-2xl p-6 relative group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-[#71717a] tracking-widest uppercase">
                Empty Section
              </h3>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[11px] font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                AI suggest
              </button>
            </div>
            
            <p className="text-[14px] text-[#71717a] mb-4">
              This section is empty — click to add content or let AI generate a suggestion.
            </p>
            
            <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
