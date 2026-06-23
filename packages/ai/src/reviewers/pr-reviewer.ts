import { generateObject } from "ai";
import { z } from "zod";
import { getProvider } from "../provider";

export const PRReviewSchema = z.object({
  isApproved: z
    .boolean()
    .describe(
      "True if the PR fully satisfies the tasks and has no obvious bugs. False if changes are required."
    ),
  summary: z
    .string()
    .describe(
      "A high-level markdown summary of the review, addressing how well the PR meets the PRD and Tasks."
    ),
  issues: z
    .array(
      z.object({
        filePath: z.string().describe("The file path where the issue exists."),
        snippet: z
          .string()
          .describe(
            "A precise 1-3 line exact snippet from the diff patch illustrating the issue. Must match the diff text exactly."
          ),
        comment: z
          .string()
          .describe("The specific feedback or requested change for this snippet."),
        isBlocking: z
          .boolean()
          .describe("True if this issue must be fixed before the PR can be merged. False for minor nits or suggestions."),
        category: z
          .enum(["prd_mismatch", "security", "performance", "edge_case", "code_quality"])
          .describe("The category of the issue."),
      })
    )
    .describe(
      "Specific issues found in the code that need fixing. Leave empty if approved."
    ),
});

export type PRReviewResult = z.infer<typeof PRReviewSchema>;

export async function generatePrReview(
  diffPayload: any,
  contextPayload: any
): Promise<PRReviewResult> {
  const model = getProvider();

  const systemPrompt = `
You are an expert, senior software engineer acting as an automated PR reviewer.
Your job is to evaluate the provided code diff against the Product Requirements Document (PRD) and specific Task Acceptance Criteria.

Guidelines:
1. Verify that the changes explicitly satisfy the linked Tasks and the overall PRD Goals and Edge Cases.
2. If the PR misses critical acceptance criteria or introduces obvious bugs, request changes (isApproved: false) and list the issues.
3. If the PR is fundamentally sound, approve it (isApproved: true). You may still leave minor nits in the issues list if they are non-blocking.
4. When logging an issue, provide the exact 'filePath' and a short 'snippet' exactly as it appears in the diff, followed by your 'comment'. Do NOT use line numbers.
5. Pay attention to 'unreviewable' flags or lockfile summaries. Do not penalize the PR if lockfiles changed expectedly.
6. For each issue, accurately classify it into one of the allowed categories: prd_mismatch, security, performance, edge_case, or code_quality.
7. Explicitly flag if an issue isBlocking. PRD mismatches and security issues are almost always blocking. Minor code quality nits should be non-blocking.
`;

  const userPrompt = `
Review Context:
${JSON.stringify(contextPayload, null, 2)}

Code Diff:
${JSON.stringify(diffPayload, null, 2)}
`;

  const { object } = await generateObject({
    model,
    schema: PRReviewSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.2, // Low temperature for analytical tasks
  });

  return object;
}
