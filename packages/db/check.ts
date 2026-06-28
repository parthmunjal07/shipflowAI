import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://neondb_owner:npg_1RPhMjuncpr9@ep-withered-night-ao02vu1d-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true" } }
});
async function main() {
  console.log("Installations:", await prisma.githubInstallation.findMany());
  console.log("States:", await prisma.githubInstallState.findMany());
}
main().then(()=>prisma.$disconnect());
