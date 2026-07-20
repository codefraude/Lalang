import { NextResponse } from "next/server";
import { runTranslationPipeline } from "@/services/translation";
import { translateSchema } from "@/utils/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Language, Register, TranslationEngine } from "@/types/translation";

export const runtime = "nodejs";

const langToEnum = {
  en: "EN",
  fr: "FR",
  mfe: "MFE",
} as const;

function registerToEnum(r: Register) {
  return r.toUpperCase() as Uppercase<Register>;
}

function engineToEnum(e: TranslationEngine) {
  return e.toUpperCase() as Uppercase<TranslationEngine>;
}

export async function POST(req: Request) {
  // Rate limiting -----------------------------------------------------------
  const limit = rateLimit(`translate:${clientKey(req)}`, 30, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // Validation --------------------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = translateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  // Translate ---------------------------------------------------------------
  const result = await runTranslationPipeline({
    text: parsed.data.text,
    source: parsed.data.source as Language | "auto",
    target: parsed.data.target as Language,
    register: parsed.data.register as Register | undefined,
  });

  // Persist history (best-effort — never blocks the response) ---------------
  try {
    const session = await auth();
    await prisma.translation.create({
      data: {
        userId: session?.user?.id ?? null,
        sourceText: result.sourceText,
        resultText: result.resultText,
        sourceLang: langToEnum[result.source],
        targetLang: langToEnum[result.target],
        register: registerToEnum(result.register),
        engine: engineToEnum(result.engine),
      },
    });
  } catch {
    // Database not ready / not configured — translation still succeeds.
  }

  return NextResponse.json(result);
}
