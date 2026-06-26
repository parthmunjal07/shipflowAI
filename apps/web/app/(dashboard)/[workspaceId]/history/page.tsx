"use client";

import { Eye, Check } from "lucide-react";
import React from "react";

export default function ReviewHistoryPage() {
  return (
    <div className="flex-1 h-full bg-[#0A0D14] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 pb-32">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
              <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
              <span className="text-[10px]">&gt;</span>
              <span className="hover:text-white cursor-pointer transition-colors">Add CSV export to reports</span>
              <span className="text-[10px]">&gt;</span>
              <span className="hover:text-white cursor-pointer transition-colors">PR #142</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa]">Review History</span>
            </div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-2">
              Review History — PR #142
            </h1>
            <div className="text-[13px] font-mono text-[#a1a1aa]">
              feat: add CSV export endpoint · acmecorp/reports-service
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-bold rounded-lg shadow-sm shrink-0">
            <Eye className="w-4 h-4" />
            Request Human Approval
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard title="REVIEW PASSES" value="3" valueColor="text-blue-500" />
          <StatCard title="ISSUES FOUND" value="8" valueColor="text-red-500" />
          <StatCard title="ISSUES RESOLVED" value="8" valueColor="text-emerald-500" />
        </div>

        {/* Timeline Container */}
        <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl p-8 mb-8 relative">
          {/* Vertical line connecting passes */}
          <div className="absolute top-[4.5rem] bottom-12 left-[41px] w-px bg-[#27272a]/50"></div>

          <div className="space-y-12 relative z-10">
            
            {/* PASS 1 */}
            <div className="flex gap-6">
              <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-white mb-1">Pass 1 · AI Review</h3>
                <p className="text-[13px] text-[#71717a] mb-4">2 days ago · triggered by push to feat/csv-export</p>
                
                <div className="bg-[#1A1E29] rounded-xl border border-[#27272a]/50 p-6">
                  {/* Chart representation */}
                  <div className="flex items-end gap-6 h-24 mb-6 border-b border-[#27272a]/50 pb-2">
                    <ChartGroup label="Security 1" bars={[{ h: "h-6", c: "bg-red-500" }]} />
                    <ChartGroup label="Performance 1" bars={[{ h: "h-6", c: "bg-amber-500" }]} />
                    <ChartGroup label="Edge Case 2" bars={[{ h: "h-10", c: "bg-amber-400" }, { h: "h-10", c: "bg-[#52525b]" }]} />
                    <ChartGroup label="Code Quality 2" bars={[{ h: "h-10", c: "bg-[#52525b]" }, { h: "h-10", c: "bg-blue-600" }]} />
                    <ChartGroup label="PRD Mismatch 2" bars={[{ h: "h-10", c: "bg-blue-600" }, { h: "h-10", c: "bg-blue-600" }]} />
                  </div>
                  
                  {/* Bullet Points */}
                  <ul className="space-y-1.5 text-[13px] text-[#a1a1aa] list-disc list-inside ml-2">
                    <li>Missing CSV streaming guard for large exports</li>
                    <li>No confirmation modal for row count</li>
                    <li>Edge case: empty dataset handling</li>
                    <li>Code quality: duplicated export formatter</li>
                    <li>PRD mismatch: filter state not preserved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* PASS 2 */}
            <div className="flex gap-6">
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-white mb-1">Pass 2 · AI Review</h3>
                <p className="text-[13px] text-[#71717a] mb-4">1 day ago · triggered by push to feat/csv-export</p>
                
                <div className="bg-[#1A1E29] rounded-xl border border-[#27272a]/50 p-6">
                  {/* Chart representation */}
                  <div className="flex items-end gap-6 h-24 mb-6 border-b border-[#27272a]/50 pb-2">
                    <ChartGroup label="Security 1/1" bars={[{ h: "h-6", c: "bg-emerald-500" }]} />
                    <ChartGroup label="Performance 1/1" bars={[{ h: "h-6", c: "bg-emerald-500" }]} />
                    <ChartGroup label="Edge Case 1/2" bars={[{ h: "h-10", c: "bg-emerald-500" }, { h: "h-10", c: "bg-[#52525b]" }]} />
                    <ChartGroup label="Code Quality 2/2" bars={[{ h: "h-10", c: "bg-emerald-500" }, { h: "h-10", c: "bg-emerald-500" }]} />
                    <ChartGroup label="PRD Mismatch 1/2" bars={[{ h: "h-10", c: "bg-emerald-500" }, { h: "h-10", c: "bg-[#52525b]" }]} />
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-[13px] font-medium">
                    <span className="text-emerald-500">Progress: 6 of 8 resolved</span>
                    <span className="text-[#71717a]">2 remaining</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PASS 3 */}
            <div className="flex gap-6">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-white mb-1">Pass 3 · AI Review</h3>
                <p className="text-[13px] text-[#71717a] mb-4">3 hours ago · triggered by push to feat/csv-export</p>
                
                <div className="bg-[#1A1E29] rounded-xl border border-[#27272a]/50 p-6">
                  {/* Chart representation */}
                  <div className="flex items-end gap-6 h-24 mb-6 border-b border-[#27272a]/50 pb-2">
                    <ChartGroup label="Security 1/1" bars={[{ h: "h-6", c: "bg-emerald-500" }]} />
                    <ChartGroup label="Performance 1/1" bars={[{ h: "h-6", c: "bg-emerald-500" }]} />
                    <ChartGroup label="Edge Case 2/2" bars={[{ h: "h-10", c: "bg-emerald-500" }, { h: "h-10", c: "bg-emerald-500" }]} />
                    <ChartGroup label="Code Quality 2/2" bars={[{ h: "h-10", c: "bg-emerald-500" }, { h: "h-10", c: "bg-emerald-500" }]} />
                    <ChartGroup label="PRD Mismatch 2/2" bars={[{ h: "h-10", c: "bg-emerald-500" }, { h: "h-10", c: "bg-emerald-500" }]} />
                  </div>
                  
                  {/* Footer */}
                  <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-[13px] font-bold text-emerald-500">
                    <Check className="w-4 h-4" />
                    All issues resolved — ready for human approval
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Empty State */}
        <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl p-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#27272a]/50 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5 text-[#71717a]" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-white mb-1">No review history yet</h3>
            <p className="text-[14px] text-[#a1a1aa] mb-3">AI review will appear here after the first push to the linked branch.</p>
            <a href="#" className="text-[13px] font-medium text-blue-500 hover:text-blue-400 transition-colors">
              View PR on GitHub →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, valueColor }: { title: string, value: string, valueColor: string }) {
  return (
    <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-5">
      <h3 className="text-[11px] font-bold text-[#71717a] tracking-[0.2em] mb-2 uppercase">{title}</h3>
      <div className={`text-[32px] font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}

// Reusable Bar Chart Group Component
function ChartGroup({ label, bars }: { label: string, bars: { h: string, c: string }[] }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-end gap-1.5 h-12">
        {bars.map((bar, i) => (
          <div key={i} className={`w-4 rounded-sm ${bar.h} ${bar.c}`}></div>
        ))}
      </div>
      <span className="text-[10px] text-[#71717a] font-medium">{label}</span>
    </div>
  );
}
