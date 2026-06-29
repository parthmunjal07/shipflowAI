import { prisma } from "@repo/db";

async function test() {
  try {
    const res = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector';`;
    console.log("Vector extension:", res);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
