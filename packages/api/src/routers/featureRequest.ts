import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { generateEmbedding, storeEmbedding } from "@repo/ai";
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
        },
      });
    }),
});
