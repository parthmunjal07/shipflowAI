import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "child_process";

// We store the container in the global scope so the teardown can access it later if needed,
// though Playwright passes state differently. For Vitest, this works.
let container: StartedPostgreSqlContainer;

export default async function globalSetup() {
  console.log("[Test Setup] Starting PostgreSQL container with pgvector...");
  
  container = await new PostgreSqlContainer("pgvector/pgvector:pg16")
    .withDatabase("the_wharf_test")
    .withUsername("postgres")
    .withPassword("postgres")
    .start();

  const databaseUrl = container.getConnectionUri();
  
  process.env.DATABASE_URL = databaseUrl;
  
  // Store connection URI in an environment variable specifically for teardown to kill if needed
  // Or just rely on testcontainers daemon cleanup
  
  console.log(`[Test Setup] Database started at ${databaseUrl}`);

  console.log("[Test Setup] Running Prisma migrations...");
  try {
    execSync(`npx prisma db push --skip-generate`, {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "inherit",
    });
    console.log("[Test Setup] Prisma push complete.");
  } catch (error) {
    console.error("[Test Setup] Failed to push schema:", error);
    throw error;
  }
}

// Named export for Vitest
export const setup = globalSetup;

export async function teardown() {
  console.log("[Test Setup] Tearing down PostgreSQL container...");
  if (container) {
    await container.stop();
  }
}
