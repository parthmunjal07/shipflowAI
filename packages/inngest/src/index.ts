export { inngest } from "./client";
export type { Events } from "./client";
export { clarificationLoop } from "./functions/clarification-loop";

// Aggregate all functions for the serve handler
import { clarificationLoop } from "./functions/clarification-loop";
export const allFunctions = [clarificationLoop];
