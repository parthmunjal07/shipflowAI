import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../_app";
import { PrismaClient } from "@prisma/client";
import { inngest } from "@repo/inngest";

// Mock Inngest so we don't actually trigger background jobs during tests
vi.mock("@repo/inngest", () => ({
  inngest: {
    send: vi.fn(),
  },
}));

const prisma = new PrismaClient();

describe("Core Loop Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete the request to PRD to Task to Approval lifecycle", async () => {
    // 1. Setup Data
    const org = await prisma.organization.create({
      data: { name: "Test Org" },
    });
    
    const user = await prisma.user.create({
      data: { name: "Test User", email: "test@example.com", emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
    });

    // Mock an active session context
    const ctx = {
      prisma,
      activeOrganizationId: org.id,
      session: {
        session: { id: "sess_1", userId: user.id, token: "test", expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date(), ipAddress: null, userAgent: null, activeOrganizationId: org.id },
        user: user,
        activeOrganizationId: org.id,
      },
    };

    const caller = appRouter.createCaller(ctx);

    const project = await prisma.project.create({
      data: { name: "Test Project", organizationId: org.id, intakeToken: "test_token", publicIntakeEnabled: true },
    });

    // 2. Create Feature Request (Public Intake)
    const createRes = await caller.featureRequest.create({
      intakeToken: "test_token",
      title: "Add dark mode",
      content: "Users want dark mode.",
    });

    expect(createRes.featureRequest).toBeDefined();
    expect(createRes.featureRequest.status).toBe("PENDING");
    expect(inngest.send).toHaveBeenCalledWith(
      expect.objectContaining({ name: "the-wharf/feature-request.created" })
    );

    // 3. Simulate PRD Generation (Since we mocked Inngest, we do this manually)
    const prd = await prisma.pRD.create({
      data: {
        featureRequestId: createRes.featureRequest.id,
        problemStatement: "No dark mode.",
        goals: ["Add it"],
        nonGoals: [],
        userStories: [],
        acceptanceCriteria: ["Background is dark"],
        edgeCases: [],
        successMetrics: [],
        isFinalized: true,
      },
    });

    // Simulate Task generation completion
    await prisma.task.create({
      data: {
        projectId: project.id,
        number: 1,
        featureRequestId: createRes.featureRequest.id,
        title: "Implement dark background",
        description: "Do it",
        status: "TODO",
        category: "FRONTEND",
      }
    });

    // 4. User Approves Plan via TRPC
    await caller.featureRequest.approvePlan({
      featureRequestId: createRes.featureRequest.id,
    });

    // 5. Verify Database State
    const updatedFR = await prisma.featureRequest.findUniqueOrThrow({
      where: { id: createRes.featureRequest.id },
    });
    expect(updatedFR.status).toBe("IN_PROGRESS");

    const updatedPrd = await prisma.pRD.findUniqueOrThrow({
      where: { id: prd.id },
    });
    expect(updatedPrd.planApprovedAt).toBeDefined();

    // Verify Audit Log was created
    const auditLog = await prisma.auditLog.findFirst({
      where: { eventType: "APPROVAL_GRANTED" }
    });
    expect(auditLog).toBeDefined();
    expect(auditLog?.organizationId).toBe(org.id);
  });
});
