import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    timestamp: new Date().toISOString(),
  });
}
