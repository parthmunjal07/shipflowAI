import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@repo/db";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      return NextResponse.json({ error: "Missing secret or signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === "subscription.charged" || event.event === "subscription.authenticated") {
      const subscriptionId = event.payload.subscription.entity.id;
      const currentEnd = new Date(event.payload.subscription.entity.current_end * 1000);
      const currentStart = new Date(event.payload.subscription.entity.current_start * 1000);
      
      // Find organization first
      const org = await prisma.organization.findFirst({
        where: { razorpaySubscriptionId: subscriptionId }
      });

      if (org) {
        await prisma.$transaction([
          prisma.organization.update({
            where: { id: org.id },
            data: {
              plan: "PRO",
              subscriptionStatus: "active",
              currentPeriodStart: currentStart,
              currentPeriodEnd: currentEnd,
              aiReviewsUsed: 0, // Reset for the new cycle!
            }
          }),
          prisma.auditLog.create({
            data: {
              organizationId: org.id,
              eventType: "BILLING_UPGRADED",
              metadata: { 
                action: event.event,
                razorpaySubscriptionId: subscriptionId
              },
            }
          })
        ]);
      }
    }

    if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      const subscriptionId = event.payload.subscription.entity.id;
      const org = await prisma.organization.findFirst({
        where: { razorpaySubscriptionId: subscriptionId }
      });

      if (org) {
        await prisma.$transaction([
          prisma.organization.update({
            where: { id: org.id },
            data: {
              plan: "FREE",
              subscriptionStatus: "cancelled",
            }
          }),
          prisma.auditLog.create({
            data: {
              organizationId: org.id,
              eventType: "BILLING_CANCELLED",
              metadata: { 
                action: event.event,
                razorpaySubscriptionId: subscriptionId
              },
            }
          })
        ]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
