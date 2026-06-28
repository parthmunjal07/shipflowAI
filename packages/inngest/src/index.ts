export { inngest } from "./client";
export type { Events } from "./client";
export { clarificationLoop } from "./functions/clarification-loop";
export { generatePrd } from "./functions/generate-prd";
export { generateTasks } from "./functions/generate-tasks";
export { processPrOpened, processPrSynchronize, processPrEdited, processPrClosed } from "./functions/github-pr-tracking";
export { processPrReview } from "./functions/github-pr-review";

// Aggregate all functions for the serve handler
import { clarificationLoop } from "./functions/clarification-loop";
import { generatePrd } from "./functions/generate-prd";
import { generateTasks } from "./functions/generate-tasks";
import { processPrOpened, processPrSynchronize, processPrEdited, processPrClosed } from "./functions/github-pr-tracking";
import { processPrReview } from "./functions/github-pr-review";

export const allFunctions = [
  clarificationLoop, 
  generatePrd, 
  generateTasks,
  processPrOpened,
  processPrSynchronize,
  processPrEdited,
  processPrClosed,
  processPrReview
];
