import { z } from "zod";
import { generateObject } from "ai";
import { getProvider } from "../provider";

export const taskSchema = z.object({
  title: z
    .string()
    .describe(
      "A concise, action-oriented title for the engineering task (e.g., 'Implement user authentication API endpoint')."
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the technical work required to complete this task, including implementation details."
    ),
  category: z
    .enum(["FRONTEND", "BACKEND", "INFRA", "DESIGN", "FULLSTACK"])
    .describe("The primary technical domain for this task."),
  effort: z
    .enum(["S", "M", "L", "XL"])
    .describe("A t-shirt size estimate of the effort required. S = <1 day, M = 1-3 days, L = ~1 week, XL = >1 week."),
  satisfiedAcceptanceCriteria: z
    .array(z.string())
    .describe(
      "An array of EXACT strings representing the PRD acceptance criteria that this task fulfills. Must be exact matches to the provided PRD criteria."
    ),
  traceabilityNotes: z
    .string()
    .describe("A brief explanation of how this task satisfies the linked acceptance criteria.")
});

export const taskBreakdownSchema = z.object({
  tasks: z.array(taskSchema).describe("The comprehensive list of engineering tasks required to build the feature.")
});

export type TaskResult = z.infer<typeof taskSchema>;

/**
 * Generates an engineering task breakdown based on a finalized PRD.
 */
export async function generateTaskBreakdown(
  title: string,
  prd: {
    problemStatement: string;
    goals: string[];
    nonGoals: string[];
    userStories: string[];
    acceptanceCriteria: string[];
    edgeCases: string[];
  }
): Promise<TaskResult[]> {
  const prdContext = `
# Feature: ${title}

## Problem Statement
${prd.problemStatement}

## Goals
${prd.goals.map((g) => `- ${g}`).join("\n")}

## Non-Goals
${prd.nonGoals.map((g) => `- ${g}`).join("\n")}

## User Stories
${prd.userStories.map((s) => `- ${s}`).join("\n")}

## Acceptance Criteria (EXACT STRINGS)
${prd.acceptanceCriteria.map((ac) => `- ${ac}`).join("\n")}

## Edge Cases
${prd.edgeCases.map((ec) => `- ${ec}`).join("\n")}
`;

  const result = await generateObject({
    model: getProvider(),
    schema: taskBreakdownSchema,
    system: `You are an expert technical lead and engineering manager breaking down a Product Requirements Document (PRD) into actionable engineering tasks.
Your task is to analyze the PRD and produce a comprehensive, exhaustive list of tasks required to implement the feature.

CRITICAL TRACEABILITY REQUIREMENT:
Every single task MUST be traceable back to one or more Acceptance Criteria from the PRD.
For the \`satisfiedAcceptanceCriteria\` field, you MUST use the EXACT string from the PRD's Acceptance Criteria list. Do not paraphrase them.

Make sure the tasks cover the entire scope of the PRD (frontend, backend, infrastructure, edge cases). Provide realistic effort estimates.`,
    prompt: `Based on the following PRD, generate a complete engineering task breakdown:\n\n${prdContext}`,
  });

  return result.object.tasks;
}
