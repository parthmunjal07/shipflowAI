"use client";

import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";

export function PlanApprovalBanner({ featureRequestId }: { featureRequestId: string }) {
  const router = useRouter();
  const approvePlanMutation = trpc.featureRequest.approvePlan.useMutation();

  const handleApprove = async () => {
    await approvePlanMutation.mutateAsync({ featureRequestId });
    router.refresh();
  };

  return (
    <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-blue-900 mb-1 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Engineering Plan Drafted
        </h3>
        <p className="text-sm text-blue-700">
          The AI has generated the task breakdown. Review the tasks below. Once the team signs off, approve the plan to unlock the Kanban board for development.
        </p>
      </div>
      <button
        onClick={handleApprove}
        disabled={approvePlanMutation.isPending}
        className="shrink-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {approvePlanMutation.isPending ? "Approving..." : "Approve Plan for Development"}
      </button>
    </div>
  );
}
