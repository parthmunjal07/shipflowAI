import { prisma } from "@repo/db";
import { generateEmbedding } from "@repo/ai/src/embeddings/generate";
import { storeEmbedding } from "@repo/ai/src/embeddings/similarity";

async function test() {
  try {
    console.log("Generating embedding...");
    const text = "Test Title\n\nTest Content";
    const embedding = await generateEmbedding(text);
    console.log("Embedding generated:", embedding.length);

    console.log("Testing DB connection...");
    const project = await prisma.project.findFirst();
    if (!project) {
      console.log("No project found!");
      return;
    }
    
    console.log("Creating feature request...");
    const fr = await prisma.featureRequest.create({
      data: {
        title: "Test Title",
        content: "Test Content",
        projectId: project.id,
        source: "TICKET",
      },
    });
    console.log("Created FR:", fr.id);

    console.log("Storing embedding...");
    await storeEmbedding(prisma, fr.id, embedding);
    console.log("Embedding stored successfully!");
  } catch (err) {
    console.error("FAILED:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
