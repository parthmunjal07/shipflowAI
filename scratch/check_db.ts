import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();
async function run() {
  console.log('Installations:', await prisma.githubInstallation.findMany());
  console.log('InstallStates:', await prisma.githubInstallState.findMany());
  console.log('Orgs:', await prisma.organization.findMany({ select: { id: true, slug: true }}));
}
run().catch(console.error).finally(() => prisma.$disconnect());
