import { inngest } from "../client";
import { prisma } from "@repo/db";
import { getOctokit } from "../utils/github";

async function postCheckRun(
  githubInstallationDbId: string,
  repoFullName: string,
  headSha: string,
  status: "queued" | "in_progress" | "completed",
  conclusion?: "success" | "failure" | "neutral"
) {
  try {
    const octokit = await getOctokit(githubInstallationDbId);
    const [owner, repo] = repoFullName.split("/");

    await octokit.rest.checks.create({
      owner: owner as string,
      repo: repo as string,
      name: "ShipFlow AI Review",
      head_sha: headSha,
      status,
      conclusion,
      output: {
        title: "ShipFlow AI Review",
        summary: status === "completed" ? "Review complete." : "AI is reviewing your changes...",
      },
    });
  } catch (error) {
    console.error("Failed to post check run to GitHub", error);
  }
}

function extractTaskNumbers(payload: any): number[] {
  const textToSearch = [
    payload.pull_request?.title,
    payload.pull_request?.body,
    payload.pull_request?.head?.ref,
  ]
    .filter(Boolean)
    .join(" ");

  const matches = [...textToSearch.matchAll(/sf-(\d+)/gi)];
  return [...new Set(matches.map((m) => parseInt(m[1] || "", 10)))].filter(n => !isNaN(n));
}

async function handlePrUpsertAndLinking(payload: any) {
  const repoId = payload.repository.id;
  const githubRepo = await prisma.githubRepository.findUnique({
    where: { repoId },
  });

  if (!githubRepo) {
    return { error: "Repository not tracked" };
  }

  // 1. Upsert Pull Request
  const pr = await prisma.pullRequest.upsert({
    where: { githubId: payload.pull_request.id },
    update: {
      title: payload.pull_request.title,
      state: payload.pull_request.state,
      url: payload.pull_request.html_url,
      mergedAt: payload.pull_request.merged_at ? new Date(payload.pull_request.merged_at) : null,
    },
    create: {
      githubId: payload.pull_request.id,
      number: payload.pull_request.number,
      title: payload.pull_request.title,
      state: payload.pull_request.state,
      url: payload.pull_request.html_url,
      authorLogin: payload.pull_request.user.login,
      repositoryId: githubRepo.id,
      createdAt: new Date(payload.pull_request.created_at),
      mergedAt: payload.pull_request.merged_at ? new Date(payload.pull_request.merged_at) : null,
    },
  });

  // 2. Parse and Link Tasks
  const taskNumbers = extractTaskNumbers(payload);
  if (taskNumbers.length > 0) {
    const projects = await prisma.projectRepository.findMany({
      where: { repositoryId: githubRepo.id },
    });
    const projectIds = projects.map((p) => p.projectId);

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        number: { in: taskNumbers },
      },
    });

    if (tasks.length > 0) {
      // Connect tasks to PR
      await prisma.pullRequest.update({
        where: { id: pr.id },
        data: {
          tasks: {
            connect: tasks.map((t) => ({ id: t.id })),
          },
        },
      });

      // Update task statuses to IN_REVIEW if they aren't already DONE
      await prisma.task.updateMany({
        where: {
          id: { in: tasks.map((t) => t.id) },
          status: { not: "DONE" },
        },
        data: { status: "IN_REVIEW" },
      });
    }
  }

  return { pr, githubRepo };
}

export const processPrOpened = inngest.createFunction(
  { id: "github-pr-opened" },
  { event: "github/pull_request.opened" },
  async ({ event }) => {
    const { payload } = event.data;
    const result = await handlePrUpsertAndLinking(payload);

    if (result?.githubRepo) {
      await postCheckRun(
        result.githubRepo.installationId,
        payload.repository.full_name,
        payload.pull_request.head.sha,
        "in_progress"
      );

      const [owner, repo] = payload.repository.full_name.split("/");
      
      // Trigger AI Review Agent
      await inngest.send({
        name: "shipflow/pr.review-requested",
        data: {
          pullRequestId: result.pr.id,
          githubInstallationDbId: result.githubRepo.installationId,
          owner,
          repo,
          pullNumber: payload.pull_request.number,
          headSha: payload.pull_request.head.sha,
        },
      });
    }
  }
);

export const processPrSynchronize = inngest.createFunction(
  { id: "github-pr-synchronize" },
  { event: "github/pull_request.synchronize" },
  async ({ event }) => {
    const { payload } = event.data;
    const result = await handlePrUpsertAndLinking(payload);

    if (result?.githubRepo) {
      await postCheckRun(
        result.githubRepo.installationId,
        payload.repository.full_name,
        payload.pull_request.head.sha,
        "in_progress"
      );
      
      const [owner, repo] = payload.repository.full_name.split("/");
      
      // Trigger AI Review Agent
      await inngest.send({
        name: "shipflow/pr.review-requested",
        data: {
          pullRequestId: result.pr.id,
          githubInstallationDbId: result.githubRepo.installationId,
          owner,
          repo,
          pullNumber: payload.pull_request.number,
          headSha: payload.pull_request.head.sha,
        },
      });
    }
  }
);

export const processPrClosed = inngest.createFunction(
  { id: "github-pr-closed" },
  { event: "github/pull_request.closed" },
  async ({ event }) => {
    const { payload } = event.data;
    
    // Upsert to mark as closed
    const result = await handlePrUpsertAndLinking(payload);

    if (result?.pr && payload.pull_request.merged) {
      // If merged, automatically mark linked tasks as DONE
      const prWithTasks = await prisma.pullRequest.findUnique({
        where: { id: result.pr.id },
        include: { tasks: true },
      });

      if (prWithTasks && prWithTasks.tasks.length > 0) {
        await prisma.task.updateMany({
          where: { id: { in: prWithTasks.tasks.map((t) => t.id) } },
          data: { status: "DONE" },
        });
      }
    }
  }
);
