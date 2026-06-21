import type { PrismaClient } from "@prisma/client";

export interface SimilarFeatureRequest {
  id: string;
  title: string;
  content: string;
  status: string;
  similarity: number;
}

/**
 * Find feature requests in the same project that are semantically similar
 * to the given embedding vector using pgvector cosine distance.
 *
 * @param prisma    - Prisma client instance
 * @param projectId - Scope the search to this project
 * @param embedding - The 1024-dim vector to compare against
 * @param threshold - Cosine similarity threshold (0-1). Higher = more similar. Default 0.8
 * @param limit     - Max results to return. Default 5
 */
export async function findSimilarRequests(
  prisma: PrismaClient,
  projectId: string,
  embedding: number[],
  threshold: number = 0.8,
  limit: number = 5
): Promise<SimilarFeatureRequest[]> {
  const vectorStr = `[${embedding.join(",")}]`;

  const results = await prisma.$queryRaw<SimilarFeatureRequest[]>`
    SELECT
      id,
      title,
      content,
      status::text as status,
      1 - (embedding <=> ${vectorStr}::vector) as similarity
    FROM feature_request
    WHERE project_id = ${projectId}
      AND embedding IS NOT NULL
      AND 1 - (embedding <=> ${vectorStr}::vector) >= ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Store an embedding vector for a feature request using raw SQL,
 * since Prisma doesn't support the vector type natively.
 */
export async function storeEmbedding(
  prisma: PrismaClient,
  featureRequestId: string,
  embedding: number[]
): Promise<void> {
  const vectorStr = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    UPDATE feature_request
    SET embedding = ${vectorStr}::vector
    WHERE id = ${featureRequestId}
  `;
}
