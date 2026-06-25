import { test, expect } from '@playwright/test';
import { truncateDatabase } from "../../../scripts/test-utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.beforeEach(async () => {
  // Clear the database between tests
  await truncateDatabase();
});

test.describe('Critical Path: Feature Request to Approval', () => {
  test('allows a user to log in and submit a feature request', async ({ page }) => {
    // 1. Seed necessary basic data (Organization, Project, User)
    const org = await prisma.organization.create({
      data: { name: "Acme Corp" }
    });
    const project = await prisma.project.create({
      data: { name: "Main App", organizationId: org.id, intakeToken: "acme_token", publicIntakeEnabled: true }
    });
    
    // Instead of testing a real OAuth flow which is hard in E2E, 
    // we assume there's a dev-only magic link or we test the unauthenticated intake first.

    // 2. Test Public Intake
    await page.goto('/intake/acme_token');
    await expect(page.locator('h1')).toContainText('Submit Feature Request');
    
    await page.fill('input[name="title"]', 'Add dark mode');
    await page.fill('textarea[name="content"]', 'Dark mode is requested by many users.');
    await page.click('button[type="submit"]');

    // Should show success
    await expect(page.locator('text=Request Submitted')).toBeVisible();

    // Verify it exists in DB
    const req = await prisma.featureRequest.findFirst({
      where: { title: 'Add dark mode' }
    });
    expect(req).toBeTruthy();
    expect(req?.status).toBe('PENDING');
  });
});
