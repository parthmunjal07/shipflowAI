import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@repo/db";

export async function POST(request: Request) {
  // 1. Read headers
  const signature = request.headers.get("x-hub-signature-256");
  const githubEvent = request.headers.get("x-github-event");

  if (!signature || !githubEvent) {
    return new NextResponse("Missing headers", { status: 400 });
  }

  // 2. Read raw body
  const rawBody = await request.text();

  // 3. Cryptographic Verification
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error("GITHUB_WEBHOOK_SECRET is not configured");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const calculatedSignature = `sha256=${hmac.digest("hex")}`;

  try {
    const signatureBuffer = Buffer.from(signature, "utf8");
    const calculatedBuffer = Buffer.from(calculatedSignature, "utf8");

    if (signatureBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, calculatedBuffer)) {
      console.warn("GitHub webhook signature verification failed.");
      return new NextResponse("Unauthorized: Signature mismatch", { status: 401 });
    }
  } catch (error) {
    console.error("Error during signature verification", error);
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 4. Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const githubAction = payload.action || null;

  // 5. Synchronous Audit Log
  try {
    await (prisma as any).githubWebhookLog.create({
      data: {
        githubEvent,
        githubAction,
        payload,
      },
    });
  } catch (error) {
    console.error("Failed to insert webhook audit log", error);
    // Continue processing even if logging fails, or maybe fail fast? 
    // Usually better to log the error and continue so we don't drop the GitHub event processing.
  }

  // 6. Specific Event Dispatch via Inngest
  // We need to import the inngest client. In this monorepo, it's typically `@repo/inngest`
  // Let's import it dynamically or at the top.
  const { inngest } = await import("@repo/inngest");

  if (githubEvent === "pull_request") {
    const validActions = ["opened", "synchronize", "edited", "closed"];
    if (validActions.includes(githubAction)) {
      await inngest.send({
        name: `github/pull_request.${githubAction}` as any,
        data: { payload },
      });
    }
  }

  // Return fast 200 OK
  return new NextResponse("OK", { status: 200 });
}
