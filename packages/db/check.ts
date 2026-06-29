import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function run() {
  console.log('Installations:', await prisma.githubInstallation.findMany());
  console.log('Orgs:', await prisma.organization.findMany({ select: { id: true, slug: true }}));
}
run().catch(console.error).finally(() => prisma.$disconnect());
