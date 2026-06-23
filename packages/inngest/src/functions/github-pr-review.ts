import { inngest } from "../client";
import { getReviewContextForPullRequest } from "../utils/review-context";
import { getOctokit, fetchPullRequestDiff } from "../utils/github";
import { findDiffPosition } from "../utils/diff-mapper";
import { generatePrReview } from "@repo/ai";
import { prisma } from "@repo/db";

export const processPrReview = inngest.createFunction(
  { id: "github-pr-review" },
  { event: "shipflow/pr.review-requested" },
  async ({ event, step }) => {
    const { pullRequestId, githubInstallationDbId, owner, repo, pullNumber, headSha } = event.data;

    // 1. Fetch the Review Context (PRDs and Tasks)
    const context = await step.run("fetch-review-context", async () => {
      const data = await getReviewContextForPullRequest(pullRequestId);
      if (!data) throw new Error("Could not fetch review context. PR not found in DB.");
      return data;
    });

    // 2. Needs Context Short Circuit
    if (!context.hasLinkedTasks) {
      await step.run("handle-unlinked-pr", async () => {
        const octokit = await getOctokit(githubInstallationDbId);

        // Submit a COMMENT review asking the developer to link tasks
        await octokit.rest.pulls.createReview({
          owner,
          repo,
          pull_number: pullNumber,
          event: "COMMENT",
          body: "⚠️ **ShipFlow AI Review Skipped: No Tasks Linked**\n\nThis Pull Request is not linked to any ShipFlow Tasks, meaning I don't have a PRD or Acceptance Criteria to evaluate it against.\n\nPlease link a task by adding `SF-[number]` to the PR description or branch name, and synchronize the PR again.\n\n*If this PR is intentionally not linked to a task (e.g., a chore or hotfix), please consult your team's manual review process.*",
        });

        // Update the Check Run to action_required
        await octokit.rest.checks.create({
          owner,
          repo,
          name: "ShipFlow AI Review",
          head_sha: headSha,
          status: "completed",
          conclusion: "action_required",
          output: {
            title: "Task Link Required",
            summary: "Please link a ShipFlow Task to this PR to enable automated review.",
          },
        });

        // Update DB state and log ReviewRun
        await prisma.$transaction([
          (prisma as any).pullRequest.update({
            where: { id: pullRequestId },
            data: { reviewStatus: "AWAITING_TASK_LINK" },
          }),
          (prisma as any).reviewRun.create({
            data: {
              pullRequestId,
              headSha,
              conclusion: "AWAITING_TASK_LINK",
              summary: "Skipped: No ShipFlow Tasks linked to this Pull Request.",
            },
          }),
        ]);
      });

      return { success: false, reason: "needs_context" };
    }

    // 3. Fetch the Diff
    const diff = await step.run("fetch-pr-diff", async () => {
      return await fetchPullRequestDiff(githubInstallationDbId, owner, repo, pullNumber, headSha);
    });

    // 4. Generate AI Review
    const reviewResult = await step.run("generate-ai-review", async () => {
      // If there are totally unreviewable files (e.g. gigantic missing patches), we inject a note into the context.
      if (diff.hasUnreviewableFiles) {
        context.prds.push({
          note: "SYSTEM NOTE: Some files in the diff were completely unreviewable (too large or binary). Please mention this in your summary.",
        });
      }
      return await generatePrReview(diff, context);
    });

    // 5. Format and Post the Review to GitHub
    await step.run("post-github-review", async () => {
      const octokit = await getOctokit(githubInstallationDbId);

      let body = reviewResult.summary + "\n\n";
      const inlineComments: { path: string; position: number; body: string }[] = [];

      if (reviewResult.issues.length > 0) {
        let hasFallbackIssues = false;

        for (const issue of reviewResult.issues) {
          const blockingBadge = issue.isBlocking ? "🚨 **BLOCKING**" : "ℹ️ **NON-BLOCKING**";
          const categoryBadge = `[${issue.category.toUpperCase().replace("_", " ")}]`;
          const commentBody = `${blockingBadge} | ${categoryBadge}\n\n${issue.comment}`;

          const diffFile = diff.files.find((f) => f.filename === issue.filePath);
          let position: number | null = null;

          if (diffFile && diffFile.patch) {
            position = findDiffPosition(diffFile.patch, issue.snippet);
          }

          if (position !== null) {
            inlineComments.push({
              path: issue.filePath,
              position,
              body: commentBody,
            });
          } else {
            // Graceful Fallback
            console.warn(`[ShipFlow AI] inlineMatchFailed: true for ${issue.filePath}`);
            
            if (!hasFallbackIssues) {
              body += "### Specific Issues (Could not anchor inline):\n";
              hasFallbackIssues = true;
            }
            body += `**File**: \`${issue.filePath}\` | ${blockingBadge} | ${categoryBadge}\n`;
            body += `> ${issue.snippet.replace(/\n/g, "\n> ")}\n\n`;
            body += `${issue.comment}\n\n---\n\n`;
          }
        }
      }

      if (diff.hasUnreviewableFiles) {
        body += "\n\n⚠️ **Note**: Some files in this PR were too large or binary to be fully analyzed by the AI. A human check is recommended for those files.";
      }

      const reviewPayload: any = {
        owner,
        repo,
        pull_number: pullNumber,
        event: reviewResult.isApproved ? "APPROVE" : "REQUEST_CHANGES",
        body,
      };

      if (inlineComments.length > 0) {
        reviewPayload.comments = inlineComments;
      }

      await octokit.rest.pulls.createReview(reviewPayload);

      // 6. Update the Check Run
      await octokit.rest.checks.create({
        owner,
        repo,
        name: "ShipFlow AI Review",
        head_sha: headSha,
        status: "completed",
        conclusion: reviewResult.isApproved ? "success" : "failure",
        output: {
          title: reviewResult.isApproved ? "Review Passed" : "Changes Requested",
          summary: reviewResult.summary,
        },
      });

      const hasBlockingIssues = reviewResult.issues.some((i) => i.isBlocking);
      const finalApproved = reviewResult.isApproved && !hasBlockingIssues;
      const finalConclusion = finalApproved ? "APPROVED" : "NEEDS_FIX";

      // Update DB State and store ReviewRun + Issues
      await prisma.$transaction([
        (prisma as any).pullRequest.update({
          where: { id: pullRequestId },
          data: {
            reviewStatus: finalConclusion,
          },
        }),
        (prisma as any).reviewRun.create({
          data: {
            pullRequestId,
            headSha,
            conclusion: finalConclusion,
            summary: reviewResult.summary,
            issues: {
              create: reviewResult.issues.map((issue) => ({
                filePath: issue.filePath,
                snippet: issue.snippet,
                comment: issue.comment,
                isBlocking: issue.isBlocking,
                category: issue.category,
              })),
            },
          },
        }),
      ]);
    });

    return { success: true, approved: reviewResult.isApproved };
  }
);
