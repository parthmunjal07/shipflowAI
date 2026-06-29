import { z } from "zod";
import { router, orgProcedure, requirePermission } from "../trpc";
import { TRPCError } from "@trpc/server";

export const projectRouter = router({
  create: requirePermission("CREATE_PROJECT")
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          organizationId: ctx.activeOrganizationId,
        },
      });
      return project;
    }),

  getAll: orgProcedure.query(async ({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: {
        organizationId: ctx.activeOrganizationId,
      },
      include: {
        _count: {
          select: { featureRequests: { where: { status: { not: "SHIPPED" } } } }
        },
        repositories: {
          include: { repository: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }),

  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        include: {
          featureRequests: {
            orderBy: { createdAt: 'desc' },
            include: {
              createdBy: { select: { name: true, email: true } }
            }
          },
          repositories: {
            include: { repository: true }
          }
        }
      });

      if (!project || project.organizationId !== ctx.activeOrganizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return project;
    }),

  linkRepository: requirePermission("LINK_REPOS")
    .input(z.object({ projectId: z.string(), repositoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Security Check: Ensure project belongs to org
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId }
      });
      if (!project || project.organizationId !== ctx.activeOrganizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Project not found or access denied" });
      }

      // Security Check: Ensure repository belongs to an installation for this org
      const repo = await ctx.prisma.githubRepository.findUnique({
        where: { id: input.repositoryId },
        include: { installation: true }
      });
      if (!repo || repo.installation.organizationId !== ctx.activeOrganizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Repository not found or access denied" });
      }

      // Link them
      return ctx.prisma.projectRepository.create({
        data: {
          projectId: input.projectId,
          repositoryId: input.repositoryId
        }
      });
    }),

  unlinkRepository: requirePermission("LINK_REPOS")
    .input(z.object({ projectId: z.string(), repositoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Security Check: Ensure project belongs to org
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId }
      });
      if (!project || project.organizationId !== ctx.activeOrganizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Project not found or access denied" });
      }

      return ctx.prisma.projectRepository.delete({
        where: {
          projectId_repositoryId: {
            projectId: input.projectId,
            repositoryId: input.repositoryId
          }
        }
      });
    }),
});
