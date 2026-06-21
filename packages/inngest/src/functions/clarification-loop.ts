import { inngest } from "../client";
import { prisma } from "@repo/db";
import { classifyFeatureRequest } from "@repo/ai";

const MAX_ROUNDS = 5;
const WAIT_TIMEOUT = "7d";

export const clarificationLoop = inngest.createFunction(
  {
    id: "clarification-loop",
    name: "Feature Request Clarification Loop",
  },
  { event: "shipflow/feature-request.created" },
  async ({ event, step }) => {
    const { featureRequestId, title, content } = event.data;
    let currentContent = content;
    let round = 0;

    // Initial classification
    let classification = await step.run("classify-initial", async () => {
      return classifyFeatureRequest(title, currentContent);
    });

    // Update the feature request with initial classification
    await step.run("store-initial-classification", async () => {
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          isSpecificEnough: classification.isSpecificEnough,
          missingDimensions: classification.missingDimensions,
          followUpQuestions: classification.followUpQuestions,
          clarificationStatus: classification.isSpecificEnough
            ? "RESOLVED"
            : "AWAITING_RESPONSE",
          status: classification.isSpecificEnough ? "UNDER_REVIEW" : "PENDING",
        },
      });
    });

    // If already specific enough, we're done
    if (classification.isSpecificEnough) {
      return { status: "resolved", rounds: 0 };
    }

    // Store AI's follow-up questions as messages
    await step.run("store-questions-round-0", async () => {
      const questionsText = classification.followUpQuestions.join("\n\n");
      await prisma.clarificationMessage.create({
        data: {
          featureRequestId,
          role: "assistant",
          content: questionsText,
          round: 1,
        },
      });
    });

    // Clarification loop
    while (round < MAX_ROUNDS) {
      round++;

      // Wait for the user to answer
      const answerEvent = await step.waitForEvent(
        `wait-for-answer-round-${round}`,
        {
          event: "shipflow/clarification.answered",
          timeout: WAIT_TIMEOUT,
          if: `async.data.featureRequestId == '${featureRequestId}'`,
        }
      );

      // If timeout (user never answered), mark as stale and exit
      if (!answerEvent) {
        await step.run("handle-timeout", async () => {
          await prisma.featureRequest.update({
            where: { id: featureRequestId },
            data: { clarificationStatus: "NONE", status: "PENDING" },
          });
        });
        return { status: "timeout", rounds: round };
      }

      // Merge user's answers into the context
      currentContent = `${currentContent}\n\n--- Clarification Round ${round} ---\n${answerEvent.data.answers}`;

      // Re-classify with enriched context
      classification = await step.run(
        `re-classify-round-${round}`,
        async () => {
          return classifyFeatureRequest(title, currentContent);
        }
      );

      // Update the feature request
      await step.run(`update-classification-round-${round}`, async () => {
        await prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: {
            content: currentContent,
            isSpecificEnough: classification.isSpecificEnough,
            missingDimensions: classification.missingDimensions,
            followUpQuestions: classification.followUpQuestions,
            clarificationStatus: classification.isSpecificEnough
              ? "RESOLVED"
              : "AWAITING_RESPONSE",
            status: classification.isSpecificEnough
              ? "UNDER_REVIEW"
              : "PENDING",
          },
        });
      });

      if (classification.isSpecificEnough) {
        return { status: "resolved", rounds: round };
      }

      // Store new follow-up questions
      await step.run(`store-questions-round-${round}`, async () => {
        const questionsText = classification.followUpQuestions.join("\n\n");
        await prisma.clarificationMessage.create({
          data: {
            featureRequestId,
            role: "assistant",
            content: questionsText,
            round: round + 1,
          },
        });
      });
    }

    // Max rounds reached — mark as resolved anyway so it doesn't hang forever
    await step.run("max-rounds-reached", async () => {
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: {
          clarificationStatus: "RESOLVED",
          status: "UNDER_REVIEW",
        },
      });
    });

    return { status: "max-rounds-reached", rounds: round };
  }
);
