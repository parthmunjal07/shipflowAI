import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { mistral } from "@ai-sdk/mistral";
import { embed } from "ai";

/**
 * Returns the appropriate embedding model based on available API keys.
 * Both are standardized to 1024 dimensions so vectors are compatible
 * regardless of which provider generated them.
 */
export function getEmbeddingModel() {
  if (process.env.OPENAI_API_KEY) {
    return openai.embedding("text-embedding-3-small", { dimensions: 1024 });
  } else if (process.env.MISTRAL_API_KEY) {
    return mistral.embedding("mistral-embed");
  } else {
    throw new Error(
      "No AI provider API key found. Please set OPENAI_API_KEY or MISTRAL_API_KEY."
    );
  }
}

/**
 * Generate a 1024-dimensional embedding vector for a given text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: text,
  });
  return embedding;
}
