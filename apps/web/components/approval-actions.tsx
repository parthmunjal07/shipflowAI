"use client";

import { useState } from "react";
import { trpc } from "../trpc/client";
import { useRouter } from "next/navigation";

export function ApprovalActions({ featureRequestId, currentStatus }: { featureRequestId: string, currentStatus: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const router = useRouter();
  
  const updateStatusMutation = trpc.featureRequest.updateStatus.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
      setShowRejectForm(false);
    },
    onError: (err) => {
      console.error(err);
      setIsSubmitting(false);
      alert("Failed to update status");
    }
  });

  const handleShip = async () => {
    if (!confirm("Are you sure you want to mark this feature as SHIPPED?")) return;
    setIsSubmitting(true);
    await updateStatusMutation.mutateAsync({
      id: featureRequestId,
      status: "SHIPPED"
    });
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert("A reason is mandatory for rejection.");
      return;
    }
    
    setIsSubmitting(true);
    await updateStatusMutation.mutateAsync({
      id: featureRequestId,
      status: "IN_PROGRESS",
      approvalNotes: rejectReason.trim(),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
      <h2 className="text-lg font-bold mb-4">Approval Decision</h2>
      
      {currentStatus === "SHIPPED" ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg font-bold border border-green-200">
          ✓ This feature has been shipped
        </div>
      ) : showRejectForm ? (
        <form onSubmit={handleRejectSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Why are you returning this? (Mandatory)
            </label>
            <textarea
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[100px]"
              placeholder="e.g. The PR missed a critical edge case we discussed..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !rejectReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Returning..." : "Return"}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleShip}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Approve & Ship"}
          </button>
          
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            Return to Development
          </button>
        </div>
      )}
    </div>
  );
}
