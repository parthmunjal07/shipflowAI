import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function PullRequestPage({
  params,
}: {
  params: Promise<{ projectId: string; prId: string }>;
}) {
  const { projectId, prId } = await params;

  const pr = await prisma.pullRequest.findUnique({
    where: { id: prId },
    include: {
      repository: true,
      tasks: true,
      reviewRuns: {
        orderBy: { createdAt: "desc" },
        include: {
          issues: true,
        },
      },
    },
  });

  if (!pr) {
    notFound();
  }

  const bgMap: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-700",
    APPROVED: "bg-green-100 text-green-700",
    NEEDS_FIX: "bg-red-100 text-red-700",
    AWAITING_TASK_LINK: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          &larr; Back to Project
        </Link>
      </div>

      {/* PR Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{pr.title} <span className="text-gray-400 font-normal">#{pr.number}</span></h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bgMap[pr.reviewStatus] || bgMap.PENDING}`}>
                {pr.reviewStatus.replace("_", " ")}
              </span>
            </div>
            <div className="text-gray-600 flex items-center gap-2 text-sm">
              <span>By <strong>{pr.authorLogin}</strong></span>
              <span>•</span>
              <span>{pr.repository.fullName}</span>
              <span>•</span>
              <a href={pr.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View on GitHub</a>
            </div>
          </div>
        </div>

        {/* Linked Tasks */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Linked ShipFlow Tasks</h2>
          {pr.tasks.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm border border-yellow-200">
              No tasks linked. The AI Review Agent is bypassing this PR. Developers must link a task (e.g. SF-123) to enable review.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pr.tasks.map(task => (
                <div key={task.id} className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="font-bold text-gray-700">SF-{task.number}</span>
                  <span className="text-sm text-gray-600">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review History */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Review Audit Log</h2>
        {pr.reviewRuns.length === 0 ? (
          <div className="text-gray-500 italic bg-gray-50 p-8 rounded-xl text-center border border-gray-100">
            No AI reviews have been run for this PR yet.
          </div>
        ) : (
          <div className="space-y-6">
            {pr.reviewRuns.map((run) => (
              <div key={run.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`p-4 border-b flex justify-between items-center ${run.conclusion === "APPROVED" ? "bg-green-50 border-green-100" : run.conclusion === "NEEDS_FIX" ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${bgMap[run.conclusion] || bgMap.PENDING}`}>
                      {run.conclusion.replace("_", " ")}
                    </span>
                    <span className="font-mono text-sm text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                      commit {run.headSha.substring(0, 7)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="prose prose-sm max-w-none text-gray-700 mb-6 whitespace-pre-wrap">
                    {run.summary}
                  </div>

                  {run.issues.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Flagged Issues ({run.issues.length})</h3>
                      <div className="space-y-4">
                        {run.issues.map(issue => (
                          <div key={issue.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-mono text-sm font-semibold text-gray-800">{issue.filePath}</span>
                              <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${issue.isBlocking ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {issue.isBlocking ? 'Blocking' : 'Suggestion'}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider">
                                  {issue.category.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded-md font-mono text-sm overflow-x-auto mb-3">
                              <code>{issue.snippet}</code>
                            </div>
                            
                            <div className="text-gray-700 text-sm whitespace-pre-wrap">
                              {issue.comment}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
