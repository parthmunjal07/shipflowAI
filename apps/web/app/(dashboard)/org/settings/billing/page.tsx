import React from "react";
import { BillingClient } from "./billing-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing | Shipflow",
};

export default function BillingPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <BillingClient />
    </div>
  );
}
