import { prisma } from "@repo/db";

export async function getReviewContextForPullRequest(pullRequestId: string, serviceContext: { organizationId: string }) {
  const pr = await prisma.pullRequest.findFirst({
    where: { 
      id: pullRequestId,
      repository: {
        installation: {
          organizationId: serviceContext.organizationId
        }
      }
    },
    include: {
      tasks: {
        include: {
          featureRequest: {
            include: { prd: true }
          }
        }
      }
    }
  });

  if (!pr) return null;

  // A PR might address multiple tasks. Collect all unique PRDs from those tasks.
  const prdsMap = new Map<string, any>();
  
  const tasks = pr.tasks.map((t) => {
    if (t.featureRequest.prd) {
      prdsMap.set(t.featureRequest.prd.id, {
        id: t.featureRequest.prd.id,
        featureRequestTitle: t.featureRequest.title,
        problemStatement: t.featureRequest.prd.problemStatement,
        acceptanceCriteria: t.featureRequest.prd.acceptanceCriteria,
        edgeCases: t.featureRequest.prd.edgeCases,
        goals: t.featureRequest.prd.goals,
      });
    }

    return {
      id: t.id,
      number: t.number,
      title: t.title,
      description: t.description,
      satisfiedAcceptanceCriteria: t.satisfiedAcceptanceCriteria,
    };
  });

  return {
    pullRequest: {
      id: pr.id,
      title: pr.title,
      number: pr.number,
      url: pr.url,
      author: pr.authorLogin,
    },
    tasks,
    prds: Array.from(prdsMap.values()),
    hasLinkedTasks: tasks.length > 0,
  };
}
