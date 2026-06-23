import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { PrdEditor } from "../../../../../../components/prd-editor";
import { KanbanBoard } from "../../../../../../components/kanban-board";
import { PlanApprovalBanner } from "../../../../../../components/plan-approval-banner";
import { RequestApprovalButton } from "../../../../../../components/request-approval-button";
import Link from "next/link";

// Server-side trpc caller setup (simplified for fetching data in server components)
// Normally, we'd use server component trpc context, but for simplicity we'll just fetch via prisma here
// or construct a caller if the context is available.

export default async function FeatureRequestPage({
  params,
}: {
  params: Promise<{ projectId: string; requestId: string }>;
}) {
  const { requestId, projectId } = await params;

  // Fetch the feature request
  const featureRequest = await prisma.featureRequest.findUnique({
    where: { id: requestId, projectId },
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
      {/* If PRD exists, show the editor */}
      {featureRequest.prd ? (
        <PrdEditor 
          prd={featureRequest.prd} 
          isLocked={featureRequest.status === "SHIPPED"} 
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          {featureRequest.status === "PENDING" || featureRequest.status === "UNDER_REVIEW" ? (
            <p>This request is still being clarified. A PRD will be generated once clarification is complete.</p>
          ) : featureRequest.status === "DUPLICATE_DETECTED" ? (
            <p>This request was flagged as a duplicate. Waiting for resolution.</p>
          ) : (
            <p>No PRD has been generated for this request yet.</p>
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

      {/* Generated Tasks */}
      {featureRequest.tasks && featureRequest.tasks.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Engineering Plan</h2>
            {featureRequest.status === "IN_PROGRESS" && (
              <RequestApprovalButton 
                featureRequestId={featureRequest.id} 
                isReady={featureRequest.tasks.every(t => t.status === "DONE")} 
              />
            )}
          </div>
          {featureRequest.prd && !featureRequest.prd.planApprovedAt && (
            <PlanApprovalBanner featureRequestId={featureRequest.id} />
          )}
          <KanbanBoard 
            initialTasks={featureRequest.tasks as any} 
            isLocked={featureRequest.status === "SHIPPED" || (featureRequest.prd ? !featureRequest.prd.planApprovedAt : false)} 
            projectId={projectId}
          />
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
