import { z } from "zod";
import { router, protectedProcedure, orgProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { inngest } from "@repo/inngest";

export const pullRequestRouter = router({
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pr = await ctx.prisma.pullRequest.findFirst({
        where: {
          id: input.id,
          repository: {
            projects: {
              some: {
                project: {
                  organizationId: ctx.activeOrganizationId,
                }
              }
            }
          }
        },
        include: {
          repository: true,
          reviewRuns: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              issues: true,
            }
          },
          tasks: {
            include: {
              featureRequest: true,
            }
          }
        }
      });

      if (!pr) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pull Request not found" });
      }

      return pr;
    }),

  getHistory: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pr = await ctx.prisma.pullRequest.findFirst({
        where: {
          id: input.id,
          repository: {
            projects: {
              some: {
                project: {
                  organizationId: ctx.activeOrganizationId,
                }
              }
            }
          }
        },
        include: {
          repository: true,
          reviewRuns: {
            orderBy: { createdAt: 'asc' },
            include: {
              issues: true,
            }
          },
          tasks: {
            include: {
              featureRequest: true,
            }
          }
        }
      });

      if (!pr) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pull Request not found" });
      }

      return pr;
    }),

  rerunReview: orgProcedure
    .input(z.object({ pullRequestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pr = await ctx.prisma.pullRequest.findFirst({
        where: {
          id: input.pullRequestId,
          repository: {
            projects: {
              some: {
                project: {
                  organizationId: ctx.activeOrganizationId,
                }
              }
            }
          }
        },
        include: {
          repository: true,
          reviewRuns: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!pr) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pull Request not found" });
      }

      const ownerRepo = pr.repository.fullName.split("/");
      const owner = ownerRepo[0];
      const repo = ownerRepo[1];

      // Use the last known head SHA, or fallback
      const headSha = pr.reviewRuns[0]?.headSha || "MANUAL_RERUN";

      // Dispatch the Inngest event
      await inngest.send({
        name: "shipflow/pr.review-requested",
        data: {
          pullRequestId: pr.id,
          githubInstallationDbId: pr.repository.installationId,
          owner: owner!,
          repo: repo!,
          pullNumber: pr.number,
          headSha,
        },
      });

      return { success: true };
    }),
});
