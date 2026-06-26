import { z } from "zod";
import { router, orgProcedure } from "../trpc";

export const projectRouter = router({
  create: orgProcedure
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
});
