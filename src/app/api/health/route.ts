import { NextResponse } from "next/server";
import { aiConfigured } from "@/services/ai/chat";
import { aiModel } from "@/services/ai/provider";

export const runtime = "nodejs";

export async function GET() {
  const configured = aiConfigured();
  return NextResponse.json({
    status: "ok",
    aiConfigured: configured,
    aiModel: configured ? aiModel() : null,
    timestamp: new Date().toISOString(),
  });
}
