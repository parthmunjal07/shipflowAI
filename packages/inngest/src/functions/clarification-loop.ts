import { inngest } from "../client";
import { prisma } from "@repo/db";
import {
  classifyFeatureRequest,
  educateAboutDuplicate,
  generateEmbedding,
  findSimilarRequests,
} from "@repo/ai";

const MAX_ROUNDS = 5;
const WAIT_TIMEOUT = "7d";
const DUPLICATE_SIMILARITY_THRESHOLD = 0.85;

export const clarificationLoop = inngest.createFunction(
  {
    id: "clarification-loop",
    name: "Feature Request Clarification Loop",
  },
  { event: "the-wharf/feature-request.created" },
  async ({ event, step }) => {
    const { featureRequestId, projectId, title, content } = event.data;
    let currentContent = content;
    let round = 0;

    await step.run("set-processing-analyzing-start", async () => {
      await prisma.featureRequest.update({
        where: { id: featureRequestId },
        data: { processingState: "ANALYZING_INTAKE" },
      });
    });

    // ─── Step 0: Duplicate Detection ────────────────────────────────
    const duplicateResult = await step.run("check-duplicates", async () => {
      const embedding = await generateEmbedding(`${title}\n\n${content}`);

      // Find similar requests in the same project, excluding this one
      const similar = await findSimilarRequests(
        prisma,
        projectId,
        embedding,
        DUPLICATE_SIMILARITY_THRESHOLD,
        5
      );

      // Filter out the request itself (its embedding was just stored)
      const otherSimilar = similar.filter((r) => r.id !== featureRequestId);

      if (otherSimilar.length === 0) {
        return { hasDuplicate: false, education: null, topMatch: null };
      }

      // Ask AI to evaluate whether these are truly duplicates
      const education = await educateAboutDuplicate(
        title,
        content,
        otherSimilar
      );

      return {
        hasDuplicate: education.isDuplicate,
        education,
        topMatch: otherSimilar[0],
      };
    });

    // If a near-duplicate was found, educate the user and wait for their decision
    if (duplicateResult.hasDuplicate && duplicateResult.education) {
      await step.run("store-duplicate-detection", async () => {
        await prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: {
            status: "DUPLICATE_DETECTED",
            duplicateOfId: duplicateResult.education!.primaryMatchId || duplicateResult.topMatch?.id,
            duplicateNote: duplicateResult.education!.explanation,
            duplicateSimilarity: duplicateResult.topMatch?.similarity,
          },
        });

        // Store the AI explanation as a clarification message so the user sees it
        const educationMessage = [
          `🔍 **Similar feature request detected**\n`,
          duplicateResult.education!.explanation,
          "",
          duplicateResult.education!.differences.length > 0
            ? `**Differences noted:**\n${duplicateResult.education!.differences.map((d) => `• ${d}`).join("\n")}`
            : "",
          "",
          `**Recommendation:** ${formatRecommendation(duplicateResult.education!.recommendation)}`,
          "",
          "Please choose how to proceed:",
          "• **Merge** — Your request will be linked to the existing one",
          "• **Proceed** — Continue as a separate feature request",
          "• **Revise** — Update your request to clarify how it differs",
        ]
          .filter(Boolean)
          .join("\n");

        await prisma.clarificationMessage.create({
          data: {
            featureRequestId,
            role: "assistant",
            content: educationMessage,
            round: 0, // round 0 = pre-clarification (duplicate check)
          },
        });
      });

      await step.run("set-processing-idle-dup", async () => {
        await prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: { processingState: "IDLE" },
        });
      });

      // Wait for the user to decide what to do about the duplicate
      const duplicateResponse = await step.waitForEvent(
        "wait-for-duplicate-response",
        {
          event: "the-wharf/duplicate.responded",
          timeout: WAIT_TIMEOUT,
          if: `async.data.featureRequestId == '${featureRequestId}'`,
        }
      );

      if (!duplicateResponse) {
        // User never responded — leave it in DUPLICATE_DETECTED status
        return { status: "duplicate-timeout", rounds: 0 };
      }

      await step.run("set-processing-analyzing-dup-res", async () => {
        await prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: { processingState: "ANALYZING_INTAKE" },
        });
      });

      // Handle the user's duplicate decision
      const userAction = duplicateResponse.data.action;

      if (userAction === "merge") {
        await step.run("handle-merge", async () => {
          await prisma.featureRequest.update({
            where: { id: featureRequestId },
            data: {
              status: "REJECTED",
              clarificationStatus: "RESOLVED",
            },
          });
          await prisma.clarificationMessage.create({
            data: {
              featureRequestId,
              role: "assistant",
              content:
                "✅ Your request has been merged with the existing feature request. You'll be notified when that feature ships.",
              round: 0,
            },
          });
        });
        return { status: "merged-with-duplicate", rounds: 0 };
      }

      if (userAction === "revise" && duplicateResponse.data.revisedContent) {
        // User revised their request — update the content and continue
        currentContent = duplicateResponse.data.revisedContent;
        await step.run("handle-revise", async () => {
          await prisma.featureRequest.update({
            where: { id: featureRequestId },
            data: {
              content: currentContent,
              status: "PENDING",
              duplicateOfId: null,
              duplicateNote: null,
              duplicateSimilarity: null,
            },
          });
          await prisma.clarificationMessage.create({
            data: {
              featureRequestId,
              role: "user",
              content: `[Revised request]\n\n${currentContent}`,
              round: 0,
            },
          });
        });
        // Fall through to clarification flow with the revised content
      }

      if (userAction === "proceed") {
        // User says it's not a duplicate — clear the flags and continue
        await step.run("handle-proceed", async () => {
          await prisma.featureRequest.update({
            where: { id: featureRequestId },
            data: {
              status: "PENDING",
              duplicateOfId: null,
              duplicateNote: null,
              duplicateSimilarity: null,
            },
          });
          await prisma.clarificationMessage.create({
            data: {
              featureRequestId,
              role: "user",
              content: "I'd like to proceed with this as a separate request.",
              round: 0,
            },
          });
        });
        // Fall through to clarification flow
      }
    }

    // ─── Step 1: Initial Classification ─────────────────────────────
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
          processingState: classification.isSpecificEnough ? "IDLE" : "IDLE", // AI is done
        },
      });
    });

    // If already specific enough, we're done
    if (classification.isSpecificEnough) {
      await step.sendEvent("trigger-prd-initial", {
        name: "the-wharf/feature-request.resolved",
        data: { featureRequestId },
      });
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

    // ─── Step 2: Clarification Loop ─────────────────────────────────
    while (round < MAX_ROUNDS) {
      round++;

      await step.run(`set-processing-idle-round-${round}`, async () => {
        await prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: { processingState: "IDLE" },
        });
      });

      // Wait for the user to answer
      const answerEvent = await step.waitForEvent(
        `wait-for-answer-round-${round}`,
        {
          event: "the-wharf/clarification.answered",
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

      await step.run(`set-processing-analyzing-round-${round}`, async () => {
        await prisma.featureRequest.update({
          where: { id: featureRequestId },
          data: { processingState: "ANALYZING_INTAKE" },
        });
      });

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
            processingState: "IDLE", // AI is done for this round
          },
        });
      });

      if (classification.isSpecificEnough) {
        await step.sendEvent(`trigger-prd-round-${round}`, {
          name: "the-wharf/feature-request.resolved",
          data: { featureRequestId },
        });
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
          processingState: "IDLE",
        },
      });
    });

    await step.sendEvent("trigger-prd-max-rounds", {
      name: "the-wharf/feature-request.resolved",
      data: { featureRequestId },
    });

    return { status: "max-rounds-reached", rounds: round };
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────

function formatRecommendation(rec: "merge" | "proceed" | "revise"): string {
  switch (rec) {
    case "merge":
      return "We suggest merging this with the existing request to consolidate effort.";
    case "proceed":
      return "This appears different enough to proceed as a separate request.";
    case "revise":
      return "Consider revising your request to clarify how it differs from the existing one.";
  }
}
