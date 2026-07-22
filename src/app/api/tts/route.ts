import { NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { ttsConfigured, synthesizeSpeech } from "@/services/tts/elevenlabs";
import { ttsSchema } from "@/utils/validation";
import type { Language } from "@/types/translation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = await rateLimit(`tts:${clientKey(req)}`, 40, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // 503 tells the client to fall back to browser speech synthesis.
  if (!ttsConfigured()) {
    return NextResponse.json({ error: "Text-to-speech is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ttsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const audio = await synthesizeSpeech({ text: parsed.data.text, lang: parsed.data.lang as Language });
  if (!audio) {
    return NextResponse.json({ error: "The voice service is unavailable right now." }, { status: 502 });
  }

  // POST responses aren't HTTP-cacheable; dedup happens in the service cache
  // (server-side) and the per-session blob cache (client-side).
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg" } });
}
