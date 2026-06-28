"use client";

import React from "react";
import { Check, FileText, Loader2 } from "lucide-react";
import { trpc } from "../../../../trpc/client";

export default function BillingPage() {
  const { data: billingInfo, isLoading, refetch } = trpc.billing.getSubscriptionInfo.useQuery();
  
  const createCheckoutMutation = trpc.billing.createCheckoutOrder.useMutation({
    onSuccess: (data) => {
      alert(`Checkout order created! Subscription ID: ${data.subscriptionId}`);
      // Here you would typically initialize Razorpay Checkout
      refetch();
    },
    onError: (error) => {
      alert(`Error creating checkout order: ${error.message}`);
    }
  });

  const cancelSubscriptionMutation = trpc.billing.cancelSubscription.useMutation({
    onSuccess: () => {
      alert("Subscription cancelled successfully.");
      refetch();
    },
    onError: (error) => {
      alert(`Error cancelling subscription: ${error.message}`);
    }
  });

  const handleUpgrade = () => {
    createCheckoutMutation.mutate();
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-[#0A0D14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#71717a] animate-spin" />
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="flex-1 h-full bg-[#0A0D14] flex items-center justify-center text-white">
        Failed to load billing information.
      </div>
    );
  }

  const { plan, subscriptionStatus, usage, limits, orgName, currentPeriodEnd } = billingInfo;

  const aiReviewsPercent = limits.aiReviews > 0 ? (usage.aiReviewsUsed / limits.aiReviews) * 100 : 0;
  const reposPercent = limits.repositories > 0 ? (usage.repositoriesLinked / limits.repositories) * 100 : 0;
  const membersPercent = limits.members > 0 ? (usage.membersCount / limits.members) * 100 : 0;

  const isPro = plan === "PRO";
  const planName = isPro ? "Enterprise" : "Growth";
  const planPrice = isPro ? "$999/mo" : "$0/mo";

  return (
    <div className="flex-1 h-full bg-[#0A0D14] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 lg:p-12 pb-32">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-[13px] text-[#71717a] mb-2 flex items-center gap-1.5">
            <span className="hover:text-white cursor-pointer transition-colors">{orgName}</span>
            <span className="text-[10px]">&gt;</span>
            <span className="text-[#a1a1aa]">Billing</span>
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
            Billing & Usage
          </h1>
        </div>

        {/* Current Plan Block */}
        <div className="bg-[#13161F] border border-[#27272a]/50 rounded-2xl relative overflow-hidden mb-12">
          {/* Blue left edge highlight */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          
          <div className="p-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-[24px] font-bold text-white">{planName}</h2>
                <span className={`px-2 py-0.5 border rounded text-[11px] font-bold tracking-wide uppercase ${
                  subscriptionStatus === "active" 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}>
                  {subscriptionStatus}
                </span>
              </div>
              <div className="text-[14px] text-[#a1a1aa]">
                Billed monthly · {planPrice}
                <br />
                {currentPeriodEnd && (
                  <span className="text-[#71717a]">
                    Next invoice: {new Date(currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!isPro && (
                <button 
                  onClick={handleUpgrade}
                  disabled={createCheckoutMutation.isPending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-[14px] font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {createCheckoutMutation.isPending ? "Processing..." : "Upgrade to Enterprise"}
                </button>
              )}
              {isPro && subscriptionStatus === "active" && (
                <button 
                  onClick={handleCancel}
                  disabled={cancelSubscriptionMutation.isPending}
                  className="px-4 py-2.5 bg-transparent hover:bg-white/[0.03] transition-colors text-white text-[14px] font-bold rounded-lg border border-red-500/30 hover:border-red-500/50 hover:text-red-400"
                >
                  {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Usage This Month */}
        <div className="mb-12">
          <h3 className="text-[18px] font-bold text-white mb-1">Usage This Month</h3>
          {currentPeriodEnd && (
            <p className="text-[13px] text-[#71717a] mb-6">
              Resets {new Date(currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          
          <div className="grid grid-cols-3 gap-6">
            {/* AI Review Credits */}
            <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[14px] font-bold text-white">AI Review Credits</h4>
                {limits.aiReviews !== -1 && aiReviewsPercent >= 80 && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold tracking-wide uppercase">
                    Running low
                  </span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-[28px] font-bold text-white">{usage.aiReviewsUsed}</span>
                <span className="text-[14px] font-medium text-[#71717a]"> / {limits.aiReviews === -1 ? "∞" : limits.aiReviews}</span>
              </div>
              <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${limits.aiReviews === -1 ? 10 : Math.min(aiReviewsPercent, 100)}%` }}></div>
              </div>
              {limits.aiReviews !== -1 && (
                <div className="text-[12px] text-[#71717a] mb-1">{limits.aiReviews - usage.aiReviewsUsed} remaining</div>
              )}
            </div>

            {/* Connected Repositories */}
            <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[14px] font-bold text-white">Connected Repositories</h4>
              </div>
              <div className="mb-4">
                <span className="text-[28px] font-bold text-white">{usage.repositoriesLinked}</span>
                <span className="text-[14px] font-medium text-[#71717a]"> / {limits.repositories === -1 ? "∞" : limits.repositories}</span>
              </div>
              <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${limits.repositories === -1 ? 10 : Math.min(reposPercent, 100)}%` }}></div>
              </div>
              {limits.repositories !== -1 && (
                <div className="text-[12px] text-[#71717a]">{limits.repositories - usage.repositoriesLinked} remaining</div>
              )}
            </div>

            {/* Team Members */}
            <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[14px] font-bold text-white">Team Members</h4>
              </div>
              <div className="mb-4">
                <span className="text-[28px] font-bold text-white">{usage.membersCount}</span>
                <span className="text-[14px] font-medium text-[#71717a]"> / {limits.members === -1 ? "∞" : limits.members}</span>
              </div>
              <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${limits.members === -1 ? 10 : Math.min(membersPercent, 100)}%` }}></div>
              </div>
              {limits.members !== -1 && (
                <div className="text-[12px] text-[#71717a]">{limits.members - usage.membersCount} remaining</div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="mb-12">
          <h3 className="text-[18px] font-bold text-white mb-6">Plan Comparison</h3>
          
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl overflow-hidden mb-6">
            <div className="grid grid-cols-2">
              <div className="p-5 border-b border-r border-[#27272a]/50 bg-[#1A1E29]/50">
                <h4 className="font-bold text-white text-[15px]">Growth (Current)</h4>
              </div>
              <div className="p-5 border-b border-[#27272a]/50 bg-blue-600">
                <h4 className="font-bold text-white text-[15px]">Enterprise</h4>
              </div>

              {/* Rows */}
              <ComparisonRow left="AI Review Credits" right="Unlimited" />
              <ComparisonRow left="Repos" right="Unlimited" />
              <ComparisonRow left="Members" right="Unlimited" />
              <ComparisonRow left="SSO" right={<span className="flex items-center gap-2 text-emerald-400"><Check className="w-4 h-4" /> Yes</span>} />
              <ComparisonRow left="Priority Support" right={<span className="flex items-center gap-2 text-emerald-400"><Check className="w-4 h-4" /> Yes</span>} />
              <ComparisonRow left="SLA" right="99.9% uptime SLA" />
              <ComparisonRow left="Custom Integrations" right={<span className="flex items-center gap-2 text-emerald-400"><Check className="w-4 h-4" /> Yes</span>} last />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button className="px-6 py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 transition-colors text-blue-500 text-[14px] font-bold rounded-lg">
              Upgrade to Enterprise — Contact Sales
            </button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-white mb-6">Invoice History</h3>
          
          {/* Invoice History is currently empty */}
          
          {/* Empty State Block */}
          <div className="bg-[#13161F] border border-[#27272a]/50 rounded-xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-[#27272a]/50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#71717a]" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-white mb-1">No invoices yet — your first invoice will appear after your trial ends.</h3>
              <p className="text-[13px] text-[#71717a]">Invoice records will show up here once billing begins.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Comparison Row
function ComparisonRow({ left, right, last = false }: { left: string, right: React.ReactNode, last?: boolean }) {
  return (
    <>
      <div className={`p-5 border-r border-[#27272a]/50 ${!last ? 'border-b' : ''}`}>
        <span className="text-[14px] font-medium text-[#a1a1aa]">{left}</span>
      </div>
      <div className={`p-5 ${!last ? 'border-b border-[#27272a]/50' : ''}`}>
        <span className="text-[14px] font-bold text-white">{right}</span>
      </div>
    </>
  );
}


