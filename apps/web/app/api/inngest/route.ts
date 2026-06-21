import { serve } from "inngest/next";
import { inngest, allFunctions } from "@repo/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: allFunctions,
});
