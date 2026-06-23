import React from "react";
import Link from "next/link";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Users, CreditCard, Blocks, Settings } from "lucide-react";

export default async function OrgSettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const activeOrganizationId = session?.session?.activeOrganizationId;

  if (!activeOrganizationId) {
    notFound();
  }

  return (
    <div className="flex flex-1 min-h-0 bg-white">
      {/* Settings Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="px-6 py-6 border-b border-gray-200">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Workspace Settings</h2>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <Link
            href="/org/settings/members"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-900 bg-white shadow-sm border border-gray-200"
          >
            <Users className="w-4 h-4 text-gray-500" />
            Members & Roles
          </Link>
          <Link
            href="/org/settings/billing"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <CreditCard className="w-4 h-4 text-gray-400" />
            Billing
          </Link>
          <Link
            href="/org/settings/integrations"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <Blocks className="w-4 h-4 text-gray-400" />
            Integrations
          </Link>
          <Link
            href="/org/settings/general"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            General
          </Link>
        </nav>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
