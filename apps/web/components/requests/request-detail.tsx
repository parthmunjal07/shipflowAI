import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutList } from "lucide-react";
import { format } from "date-fns";
import { PrdEditor } from "../prd-editor";

export function RequestDetail({ request, workspaceId }: { request: any, workspaceId: string }) {
  if (!request) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#0A0D14] items-center justify-center">
        <p className="text-[#71717a] text-[14px]">Select a feature request to view details</p>
      </div>
    );
  }

  const authorName = request.createdBy?.name || request.submitterName || "Unknown";
  const dateStr = format(new Date(request.createdAt), "MMM d, yyyy");

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0D14] overflow-y-auto">
      <div className="p-8 lg:p-10 max-w-4xl w-full mx-auto">
        
        {/* Breadcrumbs & Actions */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
              <span className="hover:text-white cursor-pointer transition-colors">Feature Requests</span>
              <span className="text-[10px]">&gt;</span>
              <span className="text-[#a1a1aa] truncate max-w-[200px]">{request.title}</span>
            </div>
            <h2 className="text-[24px] font-bold text-white tracking-tight leading-tight">{request.title}</h2>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <Link href={`/${workspaceId}/requests/${request.id}/approval`} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Final Approval
            </Link>
            
            {request.prd?.isFinalized ? (
              <Link href={`/${workspaceId}/requests/${request.id}/tasks`} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm">
                <LayoutList className="w-3.5 h-3.5" />
                View Tasks
              </Link>
            ) : !request.prd && (
              <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[13px] font-medium rounded-lg shadow-sm">
                Generate PRD
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            
            <button className="px-4 py-2 bg-transparent border border-[#27272a] hover:bg-white/[0.03] transition-colors text-[#a1a1aa] hover:text-white text-[13px] font-medium rounded-lg">
              Edit
            </button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-8 text-[13px]">
          <span className="px-2.5 py-1 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 font-semibold text-[11px] capitalize">
            {request.status.replace(/_/g, " ").toLowerCase()}
          </span>
          <span className="text-[#a1a1aa]">{authorName}</span>
          <div className="flex items-center gap-2">
            <span className="text-[#71717a]">Submitted {dateStr}</span>
          </div>
        </div>

        {/* Original Request Box */}
        <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl p-6 mb-8 relative">
          <div className="text-[10px] font-bold text-[#71717a] tracking-widest uppercase mb-4">
            Original Request
          </div>
          <p className="text-[14px] text-white/90 leading-relaxed whitespace-pre-wrap">
            {request.content}
          </p>
        </div>

        {/* AI Clarification Section */}
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-white/90">AI Clarification</h3>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">AI</span>
        </div>

        {/* Chat Interface */}
        <div className="flex flex-col gap-6">
          {request.clarificationMessages?.length > 0 ? (
            request.clarificationMessages.map((msg: any) => (
              <div key={msg.id} className={`flex flex-col gap-1 w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl p-5 max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-[#1A1E29] rounded-tr-sm' 
                    : 'bg-[#13161F] border border-amber-500/50 rounded-tl-sm'
                }`}>
                  <p className="text-[14px] text-white/90 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
                <span className={`text-[11px] text-[#71717a] mt-1 ${msg.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                  {msg.role === 'user' ? authorName : 'ShipFlow AI'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-[13px] text-[#71717a] italic">
              No clarification messages yet. The AI is analyzing the request.
            </div>
          )}

          {/* If PENDING, show a mock input box for the user to answer the AI */}
          {request.status === "PENDING" && (
            <div className="flex flex-col gap-1 items-start w-full mt-2">
              <div className="w-full relative">
                <input 
                  type="text" 
                  placeholder="Type your answer..." 
                  className="w-full bg-[#0A0D14] border border-[#27272a] rounded-xl py-3 pl-4 pr-24 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors">
                  Send
                </button>
              </div>
            </div>
          )}

          {/* If PRD exists, show PRD Editor instead of pending chat status */}
          {request.prd ? (
            <div className="mt-8 pt-8 border-t border-[#27272a]/50">
              <PrdEditor prd={request.prd} />
            </div>
          ) : (
            <p className="text-[12px] text-[#71717a] italic mt-2">
              Status will advance to Ready for PRD once all clarification questions are answered.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
