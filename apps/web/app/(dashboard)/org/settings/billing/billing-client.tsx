"use client";

import React, { useState } from "react";
import { trpc } from "../../../../../trpc/client";
import { CreditCard, Rocket, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Script from "next/script";

export function BillingClient() {
  const { data: billingInfo, isLoading, refetch } = trpc.billing.getSubscriptionInfo.useQuery();
  const checkoutMutation = trpc.billing.createCheckoutOrder.useMutation();
  const cancelMutation = trpc.billing.cancelSubscription.useMutation();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      const res = await checkoutMutation.mutateAsync();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy_key",
        subscription_id: res.subscriptionId,
        name: "ShipFlow AI",
        description: "Upgrade to PRO Plan",
        handler: function (response: any) {
          // Typically we wait for the webhook, but we can do an optimistic refresh
          alert("Payment Successful! Your subscription is active.");
          refetch();
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();

    } catch (error: any) {
      alert("Checkout failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your PRO subscription? You will lose unlimited repositories and high AI limits at the end of the billing cycle.")) return;
    
    try {
      setIsProcessing(true);
      await cancelMutation.mutateAsync();
      alert("Subscription cancelled successfully.");
      refetch();
    } catch (error: any) {
      alert("Failed to cancel: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!billingInfo) return null;

  const isPro = billingInfo.plan === "PRO";
  const repoLimit = billingInfo.limits.repositories === -1 ? "Unlimited" : billingInfo.limits.repositories;
  
  const aiProgress = Math.min(100, (billingInfo.usage.aiReviewsUsed / billingInfo.limits.aiReviews) * 100);

  return (
    <div className="space-y-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header section */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Usage</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your subscription plan and monitor your AI review usage.
        </p>
      </div>

      {/* Plan Card */}
      <div className={`rounded-xl border ${isPro ? "border-purple-200 bg-purple-50/30" : "border-gray-200 bg-white"} overflow-hidden shadow-sm`}>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {isPro ? "ShipFlow PRO" : "ShipFlow FREE"}
              </h2>
              {isPro && billingInfo.subscriptionStatus === "active" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 max-w-xl">
              {isPro 
                ? "You have access to unlimited repositories and 100 AI PR Reviews per billing cycle."
                : "You are on the free tier. Link up to 3 repositories and get 10 AI PR Reviews per month to test out the platform."}
            </p>
            {billingInfo.currentPeriodEnd && isPro && (
              <p className="text-xs text-gray-500 mt-3">
                Current billing cycle ends on {new Date(billingInfo.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {!isPro ? (
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
                Upgrade to Pro
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* AI Reviews Meter */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">AI Reviews</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{billingInfo.usage.aiReviewsUsed}</span>
                  <span className="text-sm font-medium text-gray-500">/ {billingInfo.limits.aiReviews}</span>
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-gray-200" />
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-500 ${aiProgress >= 90 ? 'bg-red-500' : 'bg-black'}`}
                style={{ width: `${aiProgress}%` }}
              ></div>
            </div>
            {aiProgress >= 90 && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                Approaching limit for this cycle.
              </p>
            )}
          </div>

          {/* Repositories Linked */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Repositories Linked</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{billingInfo.usage.repositoriesLinked}</span>
                  <span className="text-sm font-medium text-gray-500">/ {repoLimit}</span>
                </div>
              </div>
              <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0v14h14V5H5zm2 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            {!isPro && billingInfo.usage.repositoriesLinked >= 3 && (
              <p className="text-xs text-orange-600 flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" />
                Repository limit reached.
              </p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
