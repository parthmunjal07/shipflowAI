import { z } from "zod";
import { generateObject } from "ai";
import { getProvider } from "../provider";

export const prdSchema = z.object({
  problemStatement: z
    .string()
    .describe(
      "A clear, concise description of the problem the feature solves or the opportunity it captures."
    ),
  goals: z
    .array(z.string())
    .describe(
      "The primary objectives this feature must achieve to be considered successful."
    ),
  nonGoals: z
    .array(z.string())
    .describe(
      "Explicit statements of what this feature is NOT trying to accomplish, to prevent scope creep."
    ),
  userStories: z
    .array(z.string())
    .describe(
      "A list of user stories from the perspective of the target audience (e.g., 'As a [user], I want to [action] so that [benefit]')."
    ),
  acceptanceCriteria: z
    .array(z.string())
    .describe(
      "Specific, testable conditions that must be met for the feature to be considered complete."
    ),
  edgeCases: z
    .array(z.string())
    .describe(
      "Uncommon but possible scenarios or error states that the implementation must handle gracefully."
    ),
  successMetrics: z
    .array(z.string())
    .describe(
      "Quantifiable metrics to measure the success and adoption of the feature post-launch."
    ),
});

export type PRDResult = z.infer<typeof prdSchema>;

/**
 * Generates a structured PRD based on the full feature request and its clarification transcript.
 * It grounds the output entirely on the provided context.
 */
export async function generateStructuredPRD(
  title: string,
  initialContent: string,
  transcript: Array<{ role: string; content: string }>
): Promise<PRDResult> {
  const formattedTranscript = transcript
    .map((msg) => `${msg.role.toUpperCase()}:\n${msg.content}`)
    .join("\n\n---\n\n");

  const fullContext = `
# Feature Request
Title: ${title}

## Initial Request
${initialContent}

## Clarification Transcript
${formattedTranscript || "No additional clarification needed."}
`;

  const result = await generateObject({
    model: getProvider(),
    schema: prdSchema,
    system: `You are an expert product manager writing a highly structured Product Requirements Document (PRD).
You will be provided with a user's initial feature request and the full transcript of clarifying questions and answers.

Your task is to synthesize this information into a precise, actionable PRD containing 7 specific fields.
CRITICAL: Do NOT invent features, requirements, or metrics that are not directly supported by or logically inferred from the provided context. Ground your response entirely in the transcript.`,
    prompt: `Based on the following request and transcript, generate the structured PRD:\n\n${fullContext}`,
  });

  return result.object;
}
