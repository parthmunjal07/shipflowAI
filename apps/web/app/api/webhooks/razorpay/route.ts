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
      
      // Upgrade to PRO and reset usage
      await prisma.organization.updateMany({
        where: { razorpaySubscriptionId: subscriptionId },
        data: {
          plan: "PRO",
          subscriptionStatus: "active",
          currentPeriodStart: currentStart,
          currentPeriodEnd: currentEnd,
          aiReviewsUsed: 0, // Reset for the new cycle!
        }
      });
    }

    if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      const subscriptionId = event.payload.subscription.entity.id;
      
      // Downgrade to FREE
      await prisma.organization.updateMany({
        where: { razorpaySubscriptionId: subscriptionId },
        data: {
          plan: "FREE",
          subscriptionStatus: "cancelled",
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
