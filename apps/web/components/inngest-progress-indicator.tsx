"use client";

import React from "react";
import { Loader2, Bot, FileText, CheckSquare, Sparkles } from "lucide-react";
import { trpc } from "../trpc/client";

export function InngestProgressIndicator({
  featureRequestId,
  initialState
}: {
  featureRequestId: string;
  initialState: string;
}) {
  const { data } = trpc.featureRequest.getById.useQuery(
    { id: featureRequestId },
    {
      initialData: { processingState: initialState } as any,
      refetchInterval: (query: any) => (query.state.data?.processingState === "IDLE" ? false : 3000),
    }
  );

  const state = (data as any)?.processingState || "IDLE";

  if (state === "IDLE") return null;

  let icon = <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
  let title = "Processing...";
  let description = "AI is working in the background.";

  switch (state) {
    case "ANALYZING_INTAKE":
      icon = <Bot className="w-5 h-5 text-purple-500 animate-pulse" />;
      title = "AI is analyzing your request...";
      description = "Checking for duplicates, missing dimensions, and formulating follow-up questions.";
      break;
    case "GENERATING_PRD":
      icon = <FileText className="w-5 h-5 text-blue-500 animate-pulse" />;
      title = "Drafting the PRD...";
      description = "Converting the clarified specs into a structured Product Requirements Document.";
      break;
    case "GENERATING_TASKS":
      icon = <CheckSquare className="w-5 h-5 text-green-500 animate-pulse" />;
      title = "Generating Engineering Tasks...";
      description = "Breaking down the finalized PRD into granular, actionable tasks.";
      break;
  }

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100 rounded-xl shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
      <div className="flex items-start gap-4 relative z-10">
        <div className="mt-1 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {title}
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
