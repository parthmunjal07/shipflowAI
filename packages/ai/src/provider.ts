import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { mistral } from "@ai-sdk/mistral";

export function getProvider() {
  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-4o-mini");
  } else if (process.env.MISTRAL_API_KEY) {
    return mistral("mistral-large-latest");
  } else {
    throw new Error(
      "No AI provider API key found. Please set OPENAI_API_KEY or MISTRAL_API_KEY."
    );
  }
}
