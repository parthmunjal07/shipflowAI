import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis instance
const redis = Redis.fromEnv();

// Webhook rate limiter (fairly generous, 100 requests per minute per IP)
const webhookLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:webhook",
});

// Strict rate limiter for public unauthenticated endpoints (e.g. intake forms)
// 5 requests per minute per IP
const publicStrictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:public",
});

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const path = request.nextUrl.pathname;

  // Rate limit Webhooks
  if (path.startsWith("/api/webhooks/")) {
    const { success, limit, reset, remaining } = await webhookLimiter.limit(ip);
    
    if (!success) {
      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Content-Type": "application/json"
        },
      });
    }
  }

  // Rate limit TRPC public intake procedures
  // The tRPC URL for the intake mutation looks like: /api/trpc/featureRequest.create
  if (path.includes("featureRequest.create")) {
    const { success, limit, reset, remaining } = await publicStrictLimiter.limit(ip);
    
    if (!success) {
      return new NextResponse(JSON.stringify({ 
        error: { message: "Too many requests. Please try again later.", code: "TOO_MANY_REQUESTS" } 
      }), {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Content-Type": "application/json"
        },
      });
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all API routes except for internal ones (like auth)
    "/api/webhooks/:path*",
    "/api/trpc/:path*",
  ],
};
