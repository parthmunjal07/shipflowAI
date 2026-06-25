import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { PrdEditor } from "../../../../../../components/prd-editor";
import { KanbanBoard } from "../../../../../../components/kanban-board";
import { PlanApprovalBanner } from "../../../../../../components/plan-approval-banner";
import { RequestApprovalButton } from "../../../../../../components/request-approval-button";
import { InngestProgressIndicator } from "../../../../../../components/inngest-progress-indicator";
import Link from "next/link";
import { MessageSquareText, CopyX, FileSignature } from "lucide-react";

// Server-side trpc caller setup (simplified for fetching data in server components)
// Normally, we'd use server component trpc context, but for simplicity we'll just fetch via prisma here
// or construct a caller if the context is available.

export default async function FeatureRequestPage({
  params,
}: {
  params: Promise<{ projectId: string; requestId: string }>;
}) {
  const { requestId, projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const activeOrganizationId = session?.session?.activeOrganizationId;

  if (!activeOrganizationId) {
    notFound();
  }

  // Fetch the feature request
  const featureRequest = await prisma.featureRequest.findUnique({
    where: { 
      id: requestId, 
      projectId,
      project: { organizationId: activeOrganizationId }
    },
    include: {
      prd: true,
      clarificationMessages: {
        orderBy: { createdAt: "asc" },
      },
      tasks: {
        orderBy: { createdAt: "asc" },
        include: {
          pullRequests: {
            select: { id: true, number: true, title: true, reviewStatus: true },
          },
        },
      },
    },
  });

  if (!featureRequest) {
    notFound();
  }

  return (
    <div>
      <InngestProgressIndicator 
        featureRequestId={featureRequest.id} 
        initialState={(featureRequest as any).processingState} 
      />

      {/* If PRD exists, show the editor */}
      {featureRequest.prd ? (
        <PrdEditor 
          prd={featureRequest.prd} 
          isLocked={featureRequest.status === "SHIPPED"} 
        />
      ) : (featureRequest as any).processingState === "GENERATING_PRD" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-10"></div>
          
          <div className="space-y-8">
            {/* Section Skeleton */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>

            {/* Section Skeleton */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>

            {/* Section Skeleton */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-3 flex flex-col">
                <div className="h-4 bg-gray-200 rounded w-full max-w-md"></div>
                <div className="h-4 bg-gray-200 rounded w-full max-w-sm"></div>
                <div className="h-4 bg-gray-200 rounded w-full max-w-lg"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
          {featureRequest.status === "PENDING" || featureRequest.status === "UNDER_REVIEW" ? (
            <>
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                <MessageSquareText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Awaiting Clarification</h3>
              <p className="text-gray-500 max-w-md">
                This request is currently going through the AI clarification loop. A detailed PRD will be automatically generated once all requirements are finalized.
              </p>
            </>
          ) : featureRequest.status === "DUPLICATE_DETECTED" ? (
            <>
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                <CopyX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Duplicate Detected</h3>
              <p className="text-gray-500 max-w-md">
                This request is very similar to an existing one in your pipeline. Please review the duplicate alert and decide how to proceed before a PRD can be drafted.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
                <FileSignature className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No PRD Generated</h3>
              <p className="text-gray-500 max-w-md">
                No Product Requirements Document has been generated for this request yet.
              </p>
            </>
          )}
        </div>
      )}

      {/* If rejected and back in progress, show reason */}
      {featureRequest.status === "IN_PROGRESS" && (featureRequest as any).approvalNotes && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-bold text-red-800 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Returned to Development
          </h3>
          <p className="text-red-700 text-sm whitespace-pre-wrap">{(featureRequest as any).approvalNotes}</p>
        </div>
      )}

      {/* Engineering Plan (Always show if PRD is generated) */}
      {featureRequest.prd && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Engineering Plan</h2>
            {featureRequest.status === "IN_PROGRESS" && featureRequest.tasks.length > 0 && (
              <RequestApprovalButton 
                featureRequestId={featureRequest.id} 
                isReady={featureRequest.tasks.every(t => t.status === "DONE")} 
              />
            )}
          </div>

          {featureRequest.tasks.length === 0 ? (
            <div className="bg-white border border-gray-200 border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No tasks generated yet</h3>
              <p className="text-gray-500 max-w-sm">
                {(featureRequest as any).processingState === "GENERATING_TASKS" 
                  ? "The AI is currently analyzing the PRD and generating the granular engineering tasks. They will appear here shortly."
                  : "If task generation failed or was skipped, you may need to retry the workflow."}
              </p>
            </div>
          ) : (
            <>
              {!featureRequest.prd.planApprovedAt && (
                <PlanApprovalBanner featureRequestId={featureRequest.id} />
              )}
              <KanbanBoard 
                initialTasks={featureRequest.tasks as any} 
                isLocked={featureRequest.status === "SHIPPED" || !featureRequest.prd.planApprovedAt} 
                projectId={projectId}
              />
            </>
          )}
        </div>
      )}

      {/* Optionally list clarification transcript below */}
      {featureRequest.clarificationMessages.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Clarification Transcript</h2>
          <div className="space-y-4">
            {featureRequest.clarificationMessages.map((msg) => (
              <div key={msg.id} className={`p-4 rounded-xl shadow-sm border ${msg.role === "assistant" ? "bg-blue-50 border-blue-100" : "bg-white border-gray-200"}`}>
                <div className="text-sm font-semibold mb-1 uppercase text-gray-500">{msg.role}</div>
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
