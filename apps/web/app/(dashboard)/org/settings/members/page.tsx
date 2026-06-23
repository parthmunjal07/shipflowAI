import React from "react";
import { MembersTable } from "./members-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members & Roles | Shipflow",
};

export default function MembersPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <MembersTable />
    </div>
  );
}
