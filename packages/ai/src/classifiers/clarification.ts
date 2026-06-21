import { z } from "zod";
import { generateObject } from "ai";
import { getProvider } from "../provider";

export const clarificationSchema = z.object({
  isSpecificEnough: z
    .boolean()
    .describe(
      "Whether the feature request has enough specific detail to proceed directly to PRD generation. True if the request clearly states the problem, desired outcome, and general requirements."
    ),
  missingDimensions: z
    .array(z.string())
    .describe(
      "List of missing dimensions (e.g., Target Audience, Success Metrics, Edge Cases, Technical Constraints). Empty if isSpecificEnough is true."
    ),
  followUpQuestions: z
    .array(z.string())
    .describe(
      "Specific, actionable questions to ask the requester to gather the missing information. Empty if isSpecificEnough is true."
    ),
});

export type ClarificationResult = z.infer<typeof clarificationSchema>;

export async function classifyFeatureRequest(
  title: string,
  content: string
): Promise<ClarificationResult> {
  const result = await generateObject({
    model: getProvider(),
    schema: clarificationSchema,
    system:
      "You are an expert product manager analyzing incoming feature requests. Your goal is to determine if a request has enough detail to write a comprehensive Product Requirements Document (PRD) and engineering tasks. If it is vague or missing key dimensions, identify what is missing and generate specific follow-up questions.",
    prompt: `Title: ${title}\nContent: ${content}`,
  });

  return result.object;
}
