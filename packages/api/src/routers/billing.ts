import { TRPCError } from "@trpc/server";
import Razorpay from "razorpay";
import { orgProcedure, router } from "../trpc";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "dummy_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

export const FREE_PLAN_LIMITS = {
  repositories: 3,
  aiReviews: 10,
  members: 20,
};

export const PRO_PLAN_LIMITS = {
  repositories: -1, // unlimited
  aiReviews: 100,
  members: -1, // unlimited
};

export const billingRouter = router({
  getSubscriptionInfo: orgProcedure.query(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.activeOrganizationId },
      include: {
        projects: {
          include: {
            repositories: true,
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!org) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Calculate active repositories
    const repoCount = org.projects.reduce((acc: number, proj: any) => acc + proj.repositories.length, 0);

    const limits = org.plan === "PRO" ? PRO_PLAN_LIMITS : FREE_PLAN_LIMITS;

    return {
      plan: org.plan,
      subscriptionStatus: org.subscriptionStatus,
      currentPeriodEnd: org.currentPeriodEnd,
      usage: {
        aiReviewsUsed: org.aiReviewsUsed,
        repositoriesLinked: repoCount,
        membersCount: org._count.members,
      },
      limits,
      orgName: org.name,
    };
  }),

  createCheckoutOrder: orgProcedure.mutation(async ({ ctx }) => {
    // We create a Razorpay Order or Subscription
    // If it's a subscription, we use razorpay.subscriptions.create
    // For simplicity, let's create a subscription to a plan.
    // The Plan ID should be configured in Razorpay Dashboard and passed via env.
    const planId = process.env.RAZORPAY_PRO_PLAN_ID;
    
    if (!planId) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Razorpay Pro Plan ID not configured" });
    }

    try {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 120, // 10 years
        notes: {
          organizationId: ctx.activeOrganizationId,
        }
      });

      return {
        subscriptionId: subscription.id,
      };
    } catch (error) {
      console.error("Razorpay subscription creation failed:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to initialize checkout" });
    }
  }),

  cancelSubscription: orgProcedure.mutation(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.activeOrganizationId },
    });

    if (!org?.razorpaySubscriptionId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No active subscription" });
    }

    try {
      await razorpay.subscriptions.cancel(org.razorpaySubscriptionId);
      
      await ctx.prisma.$transaction([
        ctx.prisma.organization.update({
          where: { id: ctx.activeOrganizationId },
          data: { subscriptionStatus: "cancelled" }
        }),
        ctx.prisma.auditLog.create({
          data: {
            organizationId: ctx.activeOrganizationId,
            userId: ctx.session?.user?.id,
            eventType: "BILLING_CANCELLED",
            metadata: { 
              action: "cancelSubscription",
              razorpaySubscriptionId: org.razorpaySubscriptionId
            },
          }
        })
      ]);

      return { success: true };
    } catch (error) {
      console.error("Razorpay subscription cancellation failed:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to cancel subscription" });
    }
  }),
});
