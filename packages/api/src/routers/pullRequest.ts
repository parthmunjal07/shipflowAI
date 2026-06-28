import { z } from "zod";
import { router, protectedProcedure, orgProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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
});
