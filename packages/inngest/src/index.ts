export { inngest } from "./client";
export type { Events } from "./client";
export { clarificationLoop } from "./functions/clarification-loop";
export { generatePrd } from "./functions/generate-prd";
export { generateTasks } from "./functions/generate-tasks";

// Aggregate all functions for the serve handler
import { clarificationLoop } from "./functions/clarification-loop";
import { generatePrd } from "./functions/generate-prd";
import { generateTasks } from "./functions/generate-tasks";
export const allFunctions = [clarificationLoop, generatePrd, generateTasks];
