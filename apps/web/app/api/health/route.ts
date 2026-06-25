import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Basic connectivity check: execute a lightweight query against the DB
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      { status: "healthy", database: "connected", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      { status: "unhealthy", database: "disconnected", timestamp: new Date().toISOString() },
      { status: 503 } // Service Unavailable
    );
  }
}
