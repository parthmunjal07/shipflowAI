import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from workspace root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();
async function link() {
  const installations = await prisma.githubInstallation.findMany({ where: { organizationId: null } });
  if (installations.length === 0) {
    console.log("No unlinked installations found.");
    return;
  }
  const org = await prisma.organization.findFirst();
  if (org) {
    for (const inst of installations) {
      await prisma.githubInstallation.update({
        where: { id: inst.id },
        data: { organizationId: org.id }
      });
      console.log(`Linked installation ${inst.installationId} to org ${org.slug}`);
    }
  }
}
link().catch(console.error).finally(() => process.exit(0));
