import { inngest } from "../client";
import { prisma } from "@repo/db";
import { generateTaskBreakdown } from "@repo/ai";

export const generateTasks = inngest.createFunction(
  { id: "generate-tasks" },
  { event: "shipflow/prd.generate-tasks" },
  async ({ event, step }) => {
    const { featureRequestId } = event.data;

    await step.run("set-processing-state-start", async () => {
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: { processingState: "GENERATING_TASKS" }
      });
    });

    // 1. Fetch the Feature Request and PRD
    const data = await step.run("fetch-prd-data", async () => {
      const fr = await prisma.featureRequest.findUniqueOrThrow({
        where: { id: featureRequestId },
        include: { prd: true },
      });

      if (!fr.prd) {
        throw new Error("Cannot generate tasks: PRD does not exist.");
      }
      if (!fr.prd.isFinalized) {
        throw new Error("Cannot generate tasks: PRD is not finalized.");
      }

      return fr;
    });

    // 2. Generate the Task Breakdown using the AI Module
    const tasks = await step.run("generate-task-breakdown", async () => {
      // Pass the PRD to the AI to extract tasks
      const generatedTasks = await generateTaskBreakdown(data.title, {
        problemStatement: data.prd!.problemStatement,
        goals: data.prd!.goals,
        nonGoals: data.prd!.nonGoals,
        userStories: data.prd!.userStories,
        acceptanceCriteria: data.prd!.acceptanceCriteria,
        edgeCases: data.prd!.edgeCases,
      });
      return generatedTasks;
    });

    // 3. Save the generated tasks to the database
    await step.run("save-tasks", async () => {
      // Use a transaction to create tasks and update the feature request status
      await prisma.$transaction(async (tx) => {
        const maxTask = await tx.task.findFirst({
          where: { projectId: data.projectId },
          orderBy: { number: 'desc' },
        });

        let nextNumber = (maxTask?.number || 0) + 1;

        for (const t of tasks) {
          await tx.task.create({
            data: {
              projectId: data.projectId,
              number: nextNumber++,
              featureRequestId,
              title: t.title,
              description: t.description,
              category: t.category,
              effort: t.effort,
              satisfiedAcceptanceCriteria: t.satisfiedAcceptanceCriteria,
              traceabilityNotes: t.traceabilityNotes,
              status: "TODO",
            },
          });
        }

        await tx.featureRequest.update({
          where: { id: featureRequestId },
          data: { 
            status: "PLANNED",
            processingState: "IDLE" 
          },
        });
      });
    });

    return { success: true, taskCount: tasks.length };
  }
);
