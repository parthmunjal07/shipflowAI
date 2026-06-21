import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { classifyFeatureRequest } from "@repo/ai";

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
      // 1. Classify the feature request
      const classification = await classifyFeatureRequest(
        input.title,
        input.content
      );

      // 2. Create the feature request in the database
      const featureRequest = await ctx.prisma.featureRequest.create({
        data: {
          title: input.title,
          content: input.content,
          submitterEmail: input.submitterEmail,
          submitterName: input.submitterName,
          projectId: input.projectId,
          source: "FORM",
          isSpecificEnough: classification.isSpecificEnough,
          missingDimensions: classification.missingDimensions,
          followUpQuestions: classification.followUpQuestions,
          createdById: ctx.session?.user?.id,
        },
      });

      return featureRequest;
    }),

  listByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.featureRequest.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
      });
    }),
});
