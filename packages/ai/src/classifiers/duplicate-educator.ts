import { z } from "zod";
import { generateObject } from "ai";
import { getProvider } from "../provider";
import type { SimilarFeatureRequest } from "../embeddings/similarity";

export const duplicateEducatorSchema = z.object({
  isDuplicate: z
    .boolean()
    .describe(
      "Whether the new request is truly a duplicate or near-duplicate of an existing one. True if they are asking for essentially the same thing, even if worded differently."
    ),
  primaryMatchId: z
    .string()
    .describe(
      "The ID of the most relevant existing feature request that this new one duplicates. Empty string if not a duplicate."
    ),
  explanation: z
    .string()
    .describe(
      "A clear, friendly explanation to the submitter about how their request relates to existing work. Should explain what the existing request covers and where it currently stands in the pipeline. Use a helpful, non-dismissive tone."
    ),
  differences: z
    .array(z.string())
    .describe(
      "Any meaningful differences between the new request and the existing one(s). If the new request adds scope or a different angle, list those here."
    ),
  recommendation: z
    .enum(["merge", "proceed", "revise"])
    .describe(
      "Recommendation for the user: 'merge' if it's clearly the same request, 'proceed' if there are enough differences to justify a new request, 'revise' if the user should revise their request to clarify how it differs."
    ),
});

export type DuplicateEducatorResult = z.infer<typeof duplicateEducatorSchema>;

/**
 * Analyzes a new feature request against similar existing requests
 * and generates a user-friendly explanation if a near-duplicate is found.
 */
export async function educateAboutDuplicate(
  newTitle: string,
  newContent: string,
  similarRequests: SimilarFeatureRequest[]
): Promise<DuplicateEducatorResult> {
  const existingContext = similarRequests
    .map(
      (r, i) =>
        `--- Existing Request #${i + 1} (ID: ${r.id}, Status: ${r.status}, Similarity: ${(r.similarity * 100).toFixed(1)}%) ---\nTitle: ${r.title}\nContent: ${r.content}`
    )
    .join("\n\n");

  const result = await generateObject({
    model: getProvider(),
    schema: duplicateEducatorSchema,
    system: `You are an expert product manager helping manage a feature request pipeline.
A user has submitted a new feature request that appears similar to existing ones in the system.

Your job is to:
1. Determine if the new request is truly a duplicate or just superficially similar
2. Write a clear, helpful explanation for the submitter
3. Identify any meaningful differences
4. Recommend whether to merge with existing, proceed as new, or ask the user to revise

Be helpful and non-dismissive. The user may not know about the existing request.
If the requests are about the same general area but have distinct goals, they are NOT duplicates.`,
    prompt: `NEW REQUEST:
Title: ${newTitle}
Content: ${newContent}

EXISTING SIMILAR REQUESTS:
${existingContext}`,
  });

  return result.object;
}
