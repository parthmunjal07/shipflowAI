import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    hasMistral: !!process.env.MISTRAL_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    db: process.env.DATABASE_URL
  });
}
