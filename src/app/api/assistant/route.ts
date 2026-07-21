import { NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { aiConfigured } from "@/services/ai/chat";
import { runAssistant, ASSISTANT_TASKS, type AssistantTask } from "@/services/ai/assistant";
import { LANGUAGES, type Language } from "@/types/translation";

export const runtime = "nodejs";

const MAX = 2000;

export async function POST(req: Request) {
  const limit = rateLimit(`assistant:${clientKey(req)}`, 20, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429, headers: { "Retry-After": "60" } });
  }

  if (!aiConfigured()) {
    return NextResponse.json({ error: "The AI assistant needs an API key to be configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const task = body.task as AssistantTask;
  const sourceText = String(body.sourceText ?? "").slice(0, MAX);
  const resultText = String(body.resultText ?? "").slice(0, MAX);
  const source = body.source as Language;
  const target = body.target as Language;
  const question = body.question ? String(body.question).slice(0, 500) : undefined;

  if (!ASSISTANT_TASKS.includes(task) || !LANGUAGES.includes(source) || !LANGUAGES.includes(target) || !resultText) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await runAssistant({ task, sourceText, resultText, source, target, question });
  if (!result) {
    return NextResponse.json({ error: "The assistant is unavailable right now. Please try again." }, { status: 502 });
  }
  return NextResponse.json(result);
}
