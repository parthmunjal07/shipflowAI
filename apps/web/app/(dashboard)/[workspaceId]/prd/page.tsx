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
    <div className={`bg-surface-card border rounded-2xl p-6 relative group transition-colors ${isActive ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-[#27272a]/50 hover:border-[#27272a]'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-[#71717a] tracking-widest uppercase">
          {title}
        </h3>
        <button className="px-3 py-1 bg-brand-mint hover:bg-brand-mintHover text-brand-dark font-bold transition-colors text-white text-[11px] font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
          AI suggest
        </button>
      </div>
      <div className="text-[14px] text-white/90 leading-relaxed">
        {children}
      </div>

      {/* Floating Toolbar for Active State */}
      {isActive && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface-elevated border border-[#27272a] rounded-lg p-1 shadow-xl z-10">
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
    <div className="flex-1 bg-surface-base h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 pb-32">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
              <span className="text-[#a1a1aa]">PRD Editor</span>
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-3">
              Product Requirements Document
            </h1>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded border border-[#27272a] bg-white/[0.02] text-[#a1a1aa] font-medium text-[11px]">
                No active document
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4 mt-2">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-mint hover:bg-brand-mintHover text-brand-dark font-bold transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm">
                Generate Tasks
                <div className="w-px h-4 bg-brand-mint text-brand-dark font-bold/50 mx-0.5" />
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

        {/* Empty State */}
        <div className="space-y-6">
          <div className="border border-dashed border-[#27272a] bg-surface-base rounded-2xl p-16 flex flex-col items-center justify-center text-center mt-12">
            <div className="w-16 h-16 bg-white/[0.02] border border-[#27272a] rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-[#71717a]" />
            </div>
            <h3 className="text-[18px] font-bold text-white mb-3">No PRD Selected</h3>
            <p className="text-[#a1a1aa] text-[15px] max-w-md mx-auto leading-relaxed">
              Select a feature request from the dashboard to view and edit its Product Requirements Document.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
