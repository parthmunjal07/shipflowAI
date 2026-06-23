"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeatureRequestTabs({ projectId, requestId }: { projectId: string; requestId: string }) {
  const pathname = usePathname();
  const baseUrl = `/projects/${projectId}/requests/${requestId}`;
  
  const isApprovalHub = pathname.endsWith("/approval");

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <Link
          href={baseUrl}
          className={`
            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            ${!isApprovalHub
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }
          `}
        >
          Overview
        </Link>
        <Link
          href={`${baseUrl}/approval`}
          className={`
            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
            ${isApprovalHub
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }
          `}
        >
          Approval Hub
        </Link>
      </nav>
    </div>
  );
}
