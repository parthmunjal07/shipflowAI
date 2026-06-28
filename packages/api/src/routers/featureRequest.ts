import { router, orgProcedure, publicIntakeProcedure, requirePermission } from "../trpc";
import { z } from "zod";
import { generateEmbedding, storeEmbedding, findSimilarRequests } from "@repo/ai";
import { inngest } from "@repo/inngest";

export const featureRequestRouter = router({
  create: publicIntakeProcedure
    .input(
      z.object({
        intakeToken: z.string(),
        title: z.string(),
        content: z.string(),
        submitterEmail: z.string().email().optional(),
        submitterName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Resolve project from intake token
      const project = await ctx.prisma.project.findUnique({
        where: { intakeToken: input.intakeToken },
      });

      if (!project || !project.publicIntakeEnabled) {
        throw new Error("Invalid or disabled intake token");
      }

      const textForAI = `${input.title}\n\n${input.content}`;

      // 1. Generate embedding for similarity search
      const embedding = await generateEmbedding(textForAI);

      // 2. Create the feature request in the database
      const featureRequest = await ctx.prisma.featureRequest.create({
        data: {
          title: input.title,
          content: input.content,
          submitterEmail: input.submitterEmail,
          submitterName: input.submitterName,
          projectId: project.id,
          source: "FORM",
          createdById: ctx.session?.user?.id,
        },
      });

      // 3. Store the embedding via raw SQL
      await storeEmbedding(ctx.prisma, featureRequest.id, embedding);

      // Fire Inngest event to kick off the clarification workflow
      await inngest.send({
        name: "shipflow/feature-request.created",
        data: {
          featureRequestId: featureRequest.id,
          projectId: project.id,
          title: input.title,
          content: input.content,
        },
      });

      return { featureRequest };
    }),

  createInternal: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project belongs to organization
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { id: input.projectId, organizationId: ctx.activeOrganizationId },
      });

      const textForAI = `${input.title}\n\n${input.content}`;
      const embedding = await generateEmbedding(textForAI);

      const featureRequest = await ctx.prisma.featureRequest.create({
        data: {
          title: input.title,
          content: input.content,
          projectId: project.id,
          source: "TICKET", // or some internal source
          createdById: ctx.session?.user?.id,
        },
      });

      await storeEmbedding(ctx.prisma, featureRequest.id, embedding);

      // Fire Inngest event
      await inngest.send({
        name: "shipflow/feature-request.created",
        data: {
          featureRequestId: featureRequest.id,
          projectId: project.id,
          title: input.title,
          content: input.content,
        },
      });

      return { featureRequest };
    }),

  submitClarification: requirePermission("SUBMIT_CLARIFICATION")
    .input(
      z.object({
        featureRequestId: z.string(),
        answers: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Get the current feature request to determine the round
      const featureRequest = await ctx.prisma.featureRequest.findFirstOrThrow({
        where: { 
          id: input.featureRequestId,
          project: { organizationId: ctx.activeOrganizationId }
        },
        include: { clarificationMessages: { orderBy: { round: "desc" }, take: 1 } },
      });

      if (featureRequest.status === "SHIPPED") {
        throw new Error("Cannot submit clarification because the feature is already shipped.");
      }

      const currentRound = featureRequest.clarificationMessages[0]?.round ?? 1;

      // 2. Store user's answer as a clarification message
      await ctx.prisma.clarificationMessage.create({
        data: {
          featureRequestId: input.featureRequestId,
          role: "user",
          content: input.answers,
          round: currentRound,
        },
      });

      // 3. Fire Inngest event to resume the workflow
      await inngest.send({
        name: "shipflow/clarification.answered",
        data: {
          featureRequestId: input.featureRequestId,
          answers: input.answers,
          round: currentRound,
        },
      });

      return { success: true };
    }),

  respondToDuplicate: orgProcedure
    .input(
      z.object({
        featureRequestId: z.string(),
        action: z.enum(["merge", "proceed", "revise"]),
        revisedContent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate the feature request is actually in DUPLICATE_DETECTED status
      const featureRequest = await ctx.prisma.featureRequest.findFirstOrThrow({
        where: { 
          id: input.featureRequestId,
          project: { organizationId: ctx.activeOrganizationId }
        },
      });

      if (featureRequest.status !== "DUPLICATE_DETECTED") {
        throw new Error(
          `Feature request is not in DUPLICATE_DETECTED status (current: ${featureRequest.status})`
        );
      }

      if (input.action === "revise" && !input.revisedContent) {
        throw new Error("revisedContent is required when action is 'revise'");
      }

      // Fire Inngest event to resume the durable workflow
      await inngest.send({
        name: "shipflow/duplicate.responded",
        data: {
          featureRequestId: input.featureRequestId,
          action: input.action,
          revisedContent: input.revisedContent,
        },
      });

      return { success: true, action: input.action };
    }),

  checkSimilar: orgProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string(),
        content: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Ensure the project belongs to the organization
      await ctx.prisma.project.findFirstOrThrow({
        where: { id: input.projectId, organizationId: ctx.activeOrganizationId }
      });

      const textForAI = `${input.title}\n\n${input.content}`;
      const embedding = await generateEmbedding(textForAI);
      const similar = await findSimilarRequests(
        ctx.prisma,
        input.projectId,
        embedding,
        0.75, // slightly lower threshold for preview
        3
      );
      return { similar };
    }),

  listByProject: orgProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.featureRequest.findMany({
        where: { 
          projectId: input.projectId,
          project: { organizationId: ctx.activeOrganizationId }
        },
        orderBy: { createdAt: "desc" },
        include: { clarificationMessages: true },
      });
    }),

  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.featureRequest.findFirstOrThrow({
        where: { 
          id: input.id,
          project: { organizationId: ctx.activeOrganizationId }
        },
        include: {
          clarificationMessages: { orderBy: { createdAt: "asc" } },
          duplicateOf: { select: { id: true, title: true, status: true } },
          prd: true,
          tasks: { orderBy: { createdAt: "asc" } },
        },
      });
    }),

  generateTasks: requirePermission("GENERATE_TASKS")
    .input(z.object({ featureRequestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      await ctx.prisma.featureRequest.findFirstOrThrow({
        where: { id: input.featureRequestId, project: { organizationId: ctx.activeOrganizationId } }
      });

      await inngest.send({
        name: "shipflow/prd.generate-tasks",
        data: { featureRequestId: input.featureRequestId },
      });
      return { success: true };
    }),

  approvePlan: requirePermission("APPROVE_PLAN")
    .input(z.object({ featureRequestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      await ctx.prisma.featureRequest.findFirstOrThrow({
        where: { id: input.featureRequestId, project: { organizationId: ctx.activeOrganizationId } }
      });

      // Use transaction to update both PRD and Feature Request, and create Audit Log
      return ctx.prisma.$transaction([
        ctx.prisma.pRD.update({
          where: { featureRequestId: input.featureRequestId },
          data: { planApprovedAt: new Date() },
        }),
        ctx.prisma.featureRequest.update({
          where: { id: input.featureRequestId },
          data: { status: "IN_PROGRESS" },
        }),
        ctx.prisma.auditLog.create({
          data: {
            organizationId: ctx.activeOrganizationId,
            userId: ctx.session?.user?.id,
            eventType: "APPROVAL_GRANTED",
            metadata: { 
              featureRequestId: input.featureRequestId,
              action: "approvePlan"
            },
          }
        })
      ]);
    }),

  updateTaskStatus: requirePermission("UPDATE_TASK_STATUS")
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findFirstOrThrow({
        where: { id: input.taskId, project: { organizationId: ctx.activeOrganizationId } },
        include: { featureRequest: { select: { status: true } } }
      });
      if (task.featureRequest.status === "SHIPPED") {
        throw new Error("Cannot update task status because the feature is already shipped.");
      }

      return ctx.prisma.task.update({
        where: { id: input.taskId },
        data: { status: input.status },
      });
    }),

  updatePrd: requirePermission("UPDATE_PRD")
    .input(
      z.object({
        prdId: z.string(),
        data: z.object({
          problemStatement: z.string().optional(),
          goals: z.array(z.string()).optional(),
          nonGoals: z.array(z.string()).optional(),
          userStories: z.array(z.string()).optional(),
          acceptanceCriteria: z.array(z.string()).optional(),
          edgeCases: z.array(z.string()).optional(),
          successMetrics: z.array(z.string()).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const prd = await ctx.prisma.pRD.findFirstOrThrow({
        where: { id: input.prdId, featureRequest: { project: { organizationId: ctx.activeOrganizationId } } },
        include: { featureRequest: { select: { status: true } } }
      });
      if (prd.featureRequest.status === "SHIPPED") {
        throw new Error("Cannot update PRD because the feature is already shipped.");
      }

      return ctx.prisma.pRD.update({
        where: { id: input.prdId },
        data: input.data,
      });
    }),

  finalizePrd: requirePermission("FINALIZE_PRD")
    .input(z.object({ prdId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.pRD.findFirstOrThrow({
        where: { id: input.prdId, featureRequest: { project: { organizationId: ctx.activeOrganizationId } } }
      });
      return ctx.prisma.pRD.update({
        where: { id: input.prdId },
        data: { isFinalized: true },
      });
    }),

  updateStatus: requirePermission("UPDATE_STATUS")
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING",
          "UNDER_REVIEW",
          "DUPLICATE_DETECTED",
          "PLANNED",
          "IN_PROGRESS",
          "READY_FOR_APPROVAL",
          "SHIPPED",
          "REJECTED",
        ]),
        approvalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.featureRequest.findFirstOrThrow({
        where: { id: input.id, project: { organizationId: ctx.activeOrganizationId } },
      });
      
      if (existing.status === "SHIPPED") {
        throw new Error("Cannot modify a Feature Request that has already been shipped.");
      }

      return ctx.prisma.featureRequest.update({
        where: { id: input.id },
        data: { 
          status: input.status,
          ...(input.approvalNotes ? { approvalNotes: input.approvalNotes } : {})
        },
      });
    }),
});
