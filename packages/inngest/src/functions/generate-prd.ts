import { inngest } from "../client";
import { prisma } from "@repo/db";
import { generateStructuredPRD } from "@repo/ai";

export const generatePrd = inngest.createFunction(
  {
    id: "generate-prd",
    name: "Generate Structured PRD",
  },
  { event: "the-wharf/feature-request.resolved" },
  async ({ event, step }) => {
    const { featureRequestId } = event.data;

    // Set state to GENERATING_PRD
    await step.run("set-processing-state-start", async () => {
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: { processingState: "GENERATING_PRD" }
      });
    });

    // 1. Fetch feature request and all clarification messages
    const featureRequest = await step.run("fetch-feature-request", async () => {
      return prisma.featureRequest.findUniqueOrThrow({
        where: { id: featureRequestId },
        include: {
          clarificationMessages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    // 2. Generate the PRD using the AI module
    const prdResult = await step.run("generate-prd-content", async () => {
      // Map clarification messages to transcript format
      const transcript = featureRequest.clarificationMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      return generateStructuredPRD(
        featureRequest.title,
        featureRequest.content, // This already has the full appended context from clarification loops
        transcript
      );
    });

    // 3. Save the structured PRD to the database
    await step.run("save-prd", async () => {
      await prisma.pRD.create({
        data: {
          featureRequestId: featureRequest.id,
          problemStatement: prdResult.problemStatement,
          goals: prdResult.goals,
          nonGoals: prdResult.nonGoals,
          userStories: prdResult.userStories,
          acceptanceCriteria: prdResult.acceptanceCriteria,
          edgeCases: prdResult.edgeCases,
          successMetrics: prdResult.successMetrics,
        },
      });
      
      // Update the status of the feature request to PLANNED now that it has a PRD
      await prisma.featureRequest.update({
        where: { id: featureRequest.id },
        data: { 
          status: "PLANNED",
          processingState: "IDLE" // Reset state
        },
      });
    });

    return { success: true, featureRequestId };
  }
);
