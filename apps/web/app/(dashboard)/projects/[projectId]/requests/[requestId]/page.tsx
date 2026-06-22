import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { PrdEditor } from "../../../../../../components/prd-editor";
import { KanbanBoard } from "../../../../../../components/kanban-board";
import { PlanApprovalBanner } from "../../../../../../components/plan-approval-banner";
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
      },
    },
  });

  if (!featureRequest) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          &larr; Back to Project
        </Link>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-sm font-medium">
            Status: {featureRequest.status}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{featureRequest.title}</h1>
        <p className="text-gray-600 whitespace-pre-wrap">{featureRequest.content}</p>
      </div>

      {/* If PRD exists, show the editor */}
      {featureRequest.prd ? (
        <PrdEditor prd={featureRequest.prd} />
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

      {/* Generated Tasks */}
      {featureRequest.tasks && featureRequest.tasks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Engineering Plan</h2>
          {featureRequest.prd && !featureRequest.prd.planApprovedAt && (
            <PlanApprovalBanner featureRequestId={featureRequest.id} />
          )}
          <KanbanBoard 
            initialTasks={featureRequest.tasks} 
            isLocked={featureRequest.prd ? !featureRequest.prd.planApprovedAt : false} 
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
