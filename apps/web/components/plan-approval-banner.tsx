"use client";

import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export function PlanApprovalBanner({ featureRequestId }: { featureRequestId: string }) {
  const router = useRouter();
  const approvePlanMutation = trpc.featureRequest.approvePlan.useMutation();

  const handleApprove = async () => {
    await approvePlanMutation.mutateAsync({ featureRequestId });
    router.refresh();
  };

  return (
    <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-[16px] font-bold text-blue-400 mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Engineering Plan Drafted
        </h3>
        <p className="text-[14px] text-blue-400/80 leading-relaxed max-w-2xl">
          The AI has generated the task breakdown. Review the tasks below. Once the team signs off, approve the plan to unlock the Kanban board and kick off development.
        </p>
      </div>
      <button
        onClick={handleApprove}
        disabled={approvePlanMutation.isPending}
        className="shrink-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {approvePlanMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {approvePlanMutation.isPending ? "Approving..." : "Approve & Start Dev"}
      </button>
    </div>
  );
}
