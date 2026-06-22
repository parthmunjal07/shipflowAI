export { inngest } from "./client";
export type { Events } from "./client";
export { clarificationLoop } from "./functions/clarification-loop";
export { generatePrd } from "./functions/generate-prd";

// Aggregate all functions for the serve handler
import { clarificationLoop } from "./functions/clarification-loop";
import { generatePrd } from "./functions/generate-prd";
export const allFunctions = [clarificationLoop, generatePrd];
