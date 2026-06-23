import { z } from "zod";
import { router, protectedProcedure, orgProcedure, requirePermission } from "../trpc";
import { TRPCError } from "@trpc/server";
import { App } from "octokit";

export class GitHubNotConfiguredError extends TRPCError {
  constructor() {
    super({
      code: "PRECONDITION_FAILED",
      message: "GITHUB_NOT_CONFIGURED",
    });
  }
}

async function getOctokitForInstallation(installationId: number) {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new GitHubNotConfiguredError();
  }

  try {
    const app = new App({
      appId,
      privateKey,
    });
    return await app.getInstallationOctokit(installationId);
  } catch (error) {
    console.error("Failed to authenticate Octokit App", error);
    throw new GitHubNotConfiguredError();
  }
}

export const githubRouter = router({
  getInstallation: requirePermission("VIEW_ORG_DATA").query(async ({ ctx }) => {
    const orgId = ctx.activeOrganizationId;
    if (!orgId) throw new Error("No active organization");

    return (ctx.prisma as any).githubInstallation.findUnique({
      where: { organizationId: orgId },
    });
  }),

  claimInstallation: requirePermission("MANAGE_INSTALLATIONS")
    .input(z.object({ installationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) throw new Error("No active organization");

      // Verify the installation exists and is unclaimed
      const installation = await (ctx.prisma as any).githubInstallation.findUnique({
        where: { installationId: input.installationId },
      });

      if (!installation) {
        throw new Error("Installation not found.");
      }

      if (installation.organizationId) {
        throw new Error("Installation is already claimed by an organization.");
      }

      return (ctx.prisma as any).githubInstallation.update({
        where: { installationId: input.installationId },
        data: { organizationId: orgId },
      });
    }),

  removeInstallation: requirePermission("MANAGE_INSTALLATIONS").mutation(async ({ ctx }) => {
    const orgId = ctx.activeOrganizationId;
    if (!orgId) throw new Error("No active organization");

    const installation = await (ctx.prisma as any).githubInstallation.findUnique({
      where: { organizationId: orgId },
    });

    if (!installation) return { success: true };

    await (ctx.prisma as any).githubInstallation.update({
      where: { id: installation.id },
      data: { organizationId: null },
    });

    return { success: true };
  }),

  // Project-level endpoints
  getProjectRepos: requirePermission("VIEW_ORG_DATA")
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const projectRepos = await (ctx.prisma as any).projectRepository.findMany({
        where: { projectId: input.projectId },
        include: { repository: true },
      });
      return projectRepos.map((pr: any) => pr.repository);
    }),

  listAvailableRepos: requirePermission("VIEW_ORG_DATA").query(async ({ ctx }) => {
    const orgId = ctx.activeOrganizationId;
    if (!orgId) throw new Error("No active organization");

    const installation = await (ctx.prisma as any).githubInstallation.findUnique({
      where: { organizationId: orgId },
    });

    if (!installation) {
      throw new GitHubNotConfiguredError();
    }

    const octokit = await getOctokitForInstallation(installation.installationId);

    try {
      // GitHub API pagination (fetch up to 100 per page, simplified for now)
      const response = await octokit.rest.apps.listReposAccessibleToInstallation({
        per_page: 100,
      });

      return response.data.repositories.map((repo: any) => ({
        id: repo.id,
        fullName: repo.full_name,
      }));
    } catch (error) {
      console.error("Failed to fetch repositories from GitHub API", error);
      throw new GitHubNotConfiguredError();
    }
  }),

  linkProjectRepo: requirePermission("LINK_REPOS")
    .input(
      z.object({
        projectId: z.string(),
        repoId: z.number(),
        fullName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.activeOrganizationId;
      if (!orgId) throw new Error("No active organization");

      const installation = await (ctx.prisma as any).githubInstallation.findUnique({
        where: { organizationId: orgId },
      });

      if (!installation) {
        throw new GitHubNotConfiguredError();
      }

      // 1. Ensure GithubRepository exists locally
      const githubRepo = await (ctx.prisma as any).githubRepository.upsert({
        where: { repoId: input.repoId },
        update: { fullName: input.fullName },
        create: {
          repoId: input.repoId,
          fullName: input.fullName,
          installationId: installation.id,
        },
      });

      // 2. Link to Project
      await (ctx.prisma as any).projectRepository.upsert({
        where: {
          projectId_repositoryId: {
            projectId: input.projectId,
            repositoryId: githubRepo.id,
          },
        },
        update: {},
        create: {
          projectId: input.projectId,
          repositoryId: githubRepo.id,
        },
      });

      return { success: true };
    }),

  unlinkProjectRepo: requirePermission("LINK_REPOS")
    .input(z.object({ projectId: z.string(), repoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const githubRepo = await (ctx.prisma as any).githubRepository.findUnique({
        where: { repoId: input.repoId },
      });

      if (githubRepo) {
        await (ctx.prisma as any).projectRepository.delete({
          where: {
            projectId_repositoryId: {
              projectId: input.projectId,
              repositoryId: githubRepo.id,
            },
          },
        }).catch(() => {
          // Ignore if the link doesn't exist
        });
      }

      return { success: true };
    }),
});
