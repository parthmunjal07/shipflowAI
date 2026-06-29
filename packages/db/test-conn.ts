import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  console.log("Attempting to connect to Neon Postgres...");
  const startTime = Date.now();
  
  try {
    const userCount = await prisma.user.count();
    const elapsed = Date.now() - startTime;
    console.log(`Connection SUCCESS! Connected in ${elapsed}ms. Found ${userCount} users.`);
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`Connection FAILED after ${elapsed}ms.`);
    console.error("Error Code:", error.code || "Unknown");
    console.error("Error Message:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
