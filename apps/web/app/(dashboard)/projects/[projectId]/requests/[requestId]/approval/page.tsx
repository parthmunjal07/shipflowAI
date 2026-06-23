import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { ApprovalActions } from "../../../../../../../components/approval-actions";
import Link from "next/link";

export default async function ApprovalHubPage({
  params,
}: {
  params: Promise<{ projectId: string; requestId: string }>;
}) {
  const { requestId, projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const activeOrganizationId = session?.session?.activeOrganizationId;

  if (!activeOrganizationId) {
    notFound();
  }

  // Deep query to get everything for approval
  const featureRequest = await prisma.featureRequest.findUnique({
    where: { 
      id: requestId, 
      projectId,
      project: { organizationId: activeOrganizationId }
    },
    include: {
      prd: true,
      tasks: {
        include: {
          pullRequests: {
            include: {
              reviewRuns: {
                orderBy: { createdAt: "desc" },
                take: 1, // Get the latest review run for each PR
                include: {
                  issues: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!featureRequest) {
    notFound();
  }

  const tasks = featureRequest.tasks || [];
  const completedTasks = tasks.filter(t => t.status === "DONE");
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Extract all unique PRs across all tasks
  const prMap = new Map();
  tasks.forEach(t => {
    t.pullRequests.forEach(pr => {
      if (!prMap.has(pr.id)) prMap.set(pr.id, pr);
    });
  });
  const allPrs = Array.from(prMap.values());
  const approvedPrs = allPrs.filter(pr => pr.reviewStatus === "APPROVED");
  const pendingPrs = allPrs.filter(pr => pr.reviewStatus !== "APPROVED");

  // Extract all unresolved issues from the latest review runs of all PRs
  const unresolvedIssues: { prNumber: number, prId: string, issue: any }[] = [];
  allPrs.forEach(pr => {
    if (pr.reviewRuns.length > 0) {
      const latestRun = pr.reviewRuns[0];
      if (latestRun.issues && latestRun.issues.length > 0) {
        latestRun.issues.forEach((issue: any) => {
          unresolvedIssues.push({ prNumber: pr.number, prId: pr.id, issue });
        });
      }
    }
  });

  const bgMap: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-700",
    APPROVED: "bg-green-100 text-green-700",
    NEEDS_FIX: "bg-red-100 text-red-700",
    AWAITING_TASK_LINK: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Tasks Completed</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold">{completedTasks.length}</span>
            <span className="text-gray-500 mb-1">/ {tasks.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${taskProgress}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Pull Requests</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold">{approvedPrs.length}</span>
            <span className="text-gray-500 mb-1">/ {allPrs.length} Approved</span>
          </div>
          {pendingPrs.length > 0 && (
            <p className="text-sm text-red-600 font-medium">{pendingPrs.length} PRs need attention</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Unresolved Issues</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold">{unresolvedIssues.length}</span>
          </div>
          {unresolvedIssues.some(i => i.issue.isBlocking) && (
            <p className="text-sm text-red-600 font-medium font-bold flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Contains blocking issues
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* PRs and Review Status */}
          <div>
            <h2 className="text-xl font-bold mb-4">Pull Requests</h2>
            {allPrs.length === 0 ? (
              <div className="bg-gray-50 text-gray-500 italic p-6 rounded-xl border border-gray-200 text-center">
                No Pull Requests have been linked to tasks for this feature yet.
              </div>
            ) : (
              <div className="space-y-3">
                {allPrs.map(pr => (
                  <div key={pr.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        #{pr.number}: {pr.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        By {pr.authorLogin}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bgMap[pr.reviewStatus] || bgMap.PENDING}`}>
                        {pr.reviewStatus.replace("_", " ")}
                      </span>
                      <Link href={`/projects/${projectId}/pull-requests/${pr.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                        Audit Log &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unresolved Issues Feed */}
          <div>
            <h2 className="text-xl font-bold mb-4">Unresolved Issues</h2>
            {unresolvedIssues.length === 0 ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center flex items-center justify-center gap-2 font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                No unresolved issues from the AI Review Agent!
              </div>
            ) : (
              <div className="space-y-4">
                {unresolvedIssues.map((item, idx) => (
                  <div key={idx} className="bg-white border-l-4 border-l-red-500 p-5 rounded-r-xl border-y border-r border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono text-sm font-semibold">{item.issue.filePath}</div>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">PR #{item.prNumber}</span>
                        {item.issue.isBlocking && (
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase">Blocking</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded-md font-mono text-xs overflow-x-auto mb-3">
                      <code>{item.issue.snippet}</code>
                    </div>
                    <p className="text-sm text-gray-700">{item.issue.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Core Contract & Actions */}
        <div className="space-y-8">
          {/* Action Card */}
          <ApprovalActions featureRequestId={featureRequest.id} currentStatus={featureRequest.status} />

          {/* Core Contract (PRD Summary) */}
          {featureRequest.prd && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">The Contract (PRD)</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Goals</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {featureRequest.prd.goals.map((g, i) => <li key={i} className="text-sm text-gray-600">{g}</li>)}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Acceptance Criteria</h3>
                  <ul className="space-y-2">
                    {featureRequest.prd.acceptanceCriteria.map((ac, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-500 font-bold">&check;</span>
                        <span>{ac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
