import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { NewRequestModal } from "./new-request-modal";
import { formatDistanceToNow } from "date-fns";

export function RequestList({ 
  requests, 
  activeRequestId,
  projectId
}: { 
  requests: any[], 
  activeRequestId: string | null,
  projectId: string
}) {
  return (
    <div className="w-[420px] flex-shrink-0 border-r border-[#27272a]/50 flex flex-col h-full bg-[#0A0D14]">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-[#27272a]/50 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[18px] font-bold text-white tracking-tight">
            Feature Requests<span className="text-[#71717a] ml-1 font-medium text-[16px]">({requests.length})</span>
          </h1>
          <NewRequestModal projectId={projectId} />
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-between px-3 py-2 bg-[#13161F] border border-[#27272a]/50 rounded-lg hover:bg-white/[0.04] transition-colors">
            <span className="text-[13px] text-white/90">All Statuses</span>
            <ChevronDown className="w-4 h-4 text-[#52525b]" />
          </button>
          <button className="flex-1 flex items-center justify-between px-3 py-2 bg-[#13161F] border border-[#27272a]/50 rounded-lg hover:bg-white/[0.04] transition-colors">
            <span className="text-[13px] text-white/90">Newest</span>
            <ChevronDown className="w-4 h-4 text-[#52525b]" />
          </button>
          <button className="p-2 bg-[#13161F] border border-[#27272a]/50 rounded-lg hover:bg-white/[0.04] transition-colors flex items-center justify-center">
            <Search className="w-4 h-4 text-[#71717a]" />
          </button>
        </div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {requests.length === 0 ? (
          <div className="text-center p-8 text-[13px] text-[#71717a]">
            No feature requests yet. Click "New Request" to get started!
          </div>
        ) : (
          requests.map((req) => {
            const isActive = req.id === activeRequestId;
            
            // Map DB status to UI styles
            let statusColor = "text-[#a1a1aa] bg-white/[0.03] border-white/[0.1]";
            if (req.status === "PENDING" || req.status === "UNDER_REVIEW") {
              statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
            } else if (req.status === "READY_FOR_APPROVAL") {
              statusColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
            } else if (req.status === "SHIPPED") {
              statusColor = "text-green-400 bg-green-500/10 border-green-500/20";
            }

            const authorName = req.createdBy?.name || req.submitterName || "Unknown";
            const initials = authorName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
            const timeAgo = formatDistanceToNow(new Date(req.createdAt), { addSuffix: true });

            return (
              <Link 
                href={`?id=${req.id}`}
                key={req.id} 
                className={`block p-4 rounded-xl cursor-pointer transition-all ${
                  isActive 
                    ? "bg-[#13161F] border-2 border-blue-500 shadow-md" 
                    : "bg-transparent hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <div className="flex gap-4">
                  {/* Status Column */}
                  <div className="w-[85px] shrink-0 flex flex-col justify-start">
                    <div className={`px-2 py-1 rounded border text-[10px] font-semibold text-center leading-tight flex items-center justify-center min-h-[40px] capitalize ${statusColor}`}>
                      {req.status.replace(/_/g, " ").toLowerCase()}
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className={`text-[14px] font-medium leading-tight truncate ${isActive ? "text-white" : "text-white/90"}`}>
                        {req.title}
                      </h3>
                      <span className="text-[12px] text-[#71717a] whitespace-nowrap shrink-0">{timeAgo}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold bg-[#27272a]">
                        {initials}
                      </div>
                      <span className="text-[12px] text-[#71717a] truncate">{authorName}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
