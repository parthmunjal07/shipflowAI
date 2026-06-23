import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { generateEmbedding, storeEmbedding, findSimilarRequests } from "@repo/ai";
import { inngest } from "@repo/inngest";

export const featureRequestRouter = router({
  create: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string(),
        content: z.string(),
        submitterEmail: z.string().email().optional(),
        submitterName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
          projectId: input.projectId,
          source: "FORM",
          createdById: ctx.session?.user?.id,
        },
      });

      // 3. Store the embedding via raw SQL
      await storeEmbedding(ctx.prisma, featureRequest.id, embedding);

      // 4. Fire Inngest event to kick off the clarification workflow
      await inngest.send({
        name: "shipflow/feature-request.created",
        data: {
          featureRequestId: featureRequest.id,
          projectId: input.projectId,
          title: input.title,
          content: input.content,
        },
      });

      return { featureRequest };
    }),

  submitClarification: publicProcedure
    .input(
      z.object({
        featureRequestId: z.string(),
        answers: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Get the current feature request to determine the round
      const featureRequest = await ctx.prisma.featureRequest.findUniqueOrThrow({
        where: { id: input.featureRequestId },
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

  respondToDuplicate: publicProcedure
    .input(
      z.object({
        featureRequestId: z.string(),
        action: z.enum(["merge", "proceed", "revise"]),
        revisedContent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate the feature request is actually in DUPLICATE_DETECTED status
      const featureRequest = await ctx.prisma.featureRequest.findUniqueOrThrow({
        where: { id: input.featureRequestId },
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

  checkSimilar: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string(),
        content: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
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

  listByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.featureRequest.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        include: { clarificationMessages: true },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.featureRequest.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          clarificationMessages: { orderBy: { createdAt: "asc" } },
          duplicateOf: { select: { id: true, title: true, status: true } },
          prd: true,
          tasks: { orderBy: { createdAt: "asc" } },
        },
      });
    }),

  generateTasks: publicProcedure
    .input(z.object({ featureRequestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await inngest.send({
        name: "shipflow/prd.generate-tasks",
        data: { featureRequestId: input.featureRequestId },
      });
      return { success: true };
    }),

  approvePlan: publicProcedure
    .input(z.object({ featureRequestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Use transaction to update both PRD and Feature Request
      return ctx.prisma.$transaction([
        ctx.prisma.pRD.update({
          where: { featureRequestId: input.featureRequestId },
          data: { planApprovedAt: new Date() },
        }),
        ctx.prisma.featureRequest.update({
          where: { id: input.featureRequestId },
          data: { status: "IN_PROGRESS" },
        }),
      ]);
    }),

  updateTaskStatus: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUniqueOrThrow({
        where: { id: input.taskId },
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

  updatePrd: publicProcedure
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
      const prd = await ctx.prisma.pRD.findUniqueOrThrow({
        where: { id: input.prdId },
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

  finalizePrd: publicProcedure
    .input(z.object({ prdId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.pRD.update({
        where: { id: input.prdId },
        data: { isFinalized: true },
      });
    }),

  updateStatus: publicProcedure
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
      const existing = await ctx.prisma.featureRequest.findUniqueOrThrow({
        where: { id: input.id },
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
