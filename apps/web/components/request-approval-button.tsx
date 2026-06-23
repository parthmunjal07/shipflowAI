"use client";

import { useState } from "react";
import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";

export function RequestApprovalButton({ featureRequestId, isReady }: { featureRequestId: string; isReady: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateStatusMutation = trpc.featureRequest.updateStatus.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
    },
    onError: (err) => {
      console.error(err);
      setIsSubmitting(false);
      alert("Failed to update status");
    }
  });

  const handleRequestApproval = async () => {
    if (!confirm("Are you sure you want to mark this feature as Ready for Approval?")) return;
    setIsSubmitting(true);
    await updateStatusMutation.mutateAsync({
      id: featureRequestId,
      status: "READY_FOR_APPROVAL"
    });
  };

  return (
    <button
      onClick={handleRequestApproval}
      disabled={isSubmitting || !isReady}
      className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
        isReady && !isSubmitting
          ? "bg-purple-600 hover:bg-purple-700 text-white"
          : "bg-gray-200 text-gray-500 cursor-not-allowed"
      }`}
      title={!isReady ? "All tasks must be DONE before requesting approval." : ""}
    >
      {isSubmitting ? "Updating..." : "Request Final Approval"}
    </button>
  );
}
