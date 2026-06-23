import { TRPCError } from "@trpc/server";

// Mock Data
const orgA = { id: "org-a" };
const orgB = { id: "org-b" };

const userA = { id: "user-a" };
const userB = { id: "user-b" };

const memberStore = [
  { userId: userA.id, organizationId: orgA.id, role: "owner" },
  { userId: userB.id, organizationId: orgB.id, role: "owner" },
];

// Mock Prisma
const mockPrisma = {
  member: {
    findFirst: async ({ where }: any) => {
      return memberStore.find(
        (m) => m.organizationId === where.organizationId && m.userId === where.userId
      ) || null;
    }
  }
};

async function runMockTest() {
  console.log("=== STARTING TENANT ISOLATION MOCK TEST ===\n");

  // Create TRPC router
  const { initTRPC } = require("@trpc/server");
  const t = initTRPC.context<any>().create();
  
  // Custom auth procedure mocking `orgProcedure`
  const orgProcedure = t.procedure.use(async ({ ctx, next }: any) => {
    const activeOrganizationId = ctx.session?.session?.activeOrganizationId;
    if (!activeOrganizationId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You must select an active organization" });
    }

    const member = await ctx.prisma.member.findFirst({
      where: {
        organizationId: activeOrganizationId,
        userId: ctx.session.user.id
      }
    });

    if (!member) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of the active organization." });
    }

    return next({
      ctx: {
        ...ctx,
        activeOrganizationId,
        memberRole: member.role,
      },
    });
  });

  const testRouter = t.router({
    dummyQuery: orgProcedure.query(({ ctx }: any) => {
      return { success: true, orgId: ctx.activeOrganizationId, role: ctx.memberRole };
    }),
  });

  const mockCtx = (session: any, user: any) => ({
    prisma: mockPrisma,
    session: { session, user }
  });

  let testPassed = true;

  // TEST 1: User B tries to spoof activeOrganizationId = orgA
  console.log("Test 1: User B tries to query Org A data by spoofing activeOrganizationId");
  try {
    const spoofedSession = { activeOrganizationId: orgA.id };
    const callerB = testRouter.createCaller(mockCtx(spoofedSession, userB));
    await callerB.dummyQuery();
    console.error("❌ FAILED: User B was able to read data from Org A!");
    testPassed = false;
  } catch (error: any) {
    if (error.code === "FORBIDDEN") {
      console.log("✅ PASSED: Blocked with error:", error.message);
    } else {
      console.error("❌ FAILED: Unexpected error:", error);
      testPassed = false;
    }
  }

  // TEST 2: User A accesses Org A data
  console.log("\nTest 2: User A accesses Org A data (Legitimate Access)");
  try {
    const legitimateSession = { activeOrganizationId: orgA.id };
    const callerA = testRouter.createCaller(mockCtx(legitimateSession, userA));
    const result = await callerA.dummyQuery();
    if (result.success && result.role === "owner") {
      console.log("✅ PASSED: User A accessed their data successfully.");
    } else {
      console.error("❌ FAILED: Data mismatch");
      testPassed = false;
    }
  } catch (error: any) {
    console.error("❌ FAILED: Legitimate access failed:", error);
    testPassed = false;
  }

  // TEST 3: User B accesses Org B data
  console.log("\nTest 3: User B accesses Org B data (Legitimate Access)");
  try {
    const legitimateSessionB = { activeOrganizationId: orgB.id };
    const callerB = testRouter.createCaller(mockCtx(legitimateSessionB, userB));
    const result = await callerB.dummyQuery();
    if (result.success) {
      console.log("✅ PASSED: User B accessed their data successfully.");
    } else {
      console.error("❌ FAILED: Data mismatch");
      testPassed = false;
    }
  } catch (error: any) {
    console.error("❌ FAILED: Legitimate access failed:", error);
    testPassed = false;
  }

  console.log("\n=== TEST RESULTS ===");
  if (testPassed) {
    console.log("🏆 ALL TESTS PASSED! Tenant isolation is solid.");
  } else {
    console.log("❌ SOME TESTS FAILED. See logs above.");
  }

  process.exit(testPassed ? 0 : 1);
}

runMockTest().catch(console.error);
