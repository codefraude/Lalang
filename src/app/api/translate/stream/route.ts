import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateSchema } from "@/utils/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { detectLanguage } from "@/services/translation/language-detection";
import { analyzeContext } from "@/services/translation/context-analysis";
import { streamAiTranslation } from "@/services/translation/ai-stream";
import { translateWithDictionary } from "@/services/translation/dictionary-fallback";
import { correctGrammar } from "@/services/translation/grammar-correction";
import { adaptCulturally } from "@/services/translation/cultural-adaptation";
import { cacheKey, getCachedTranslation, setCachedTranslation } from "@/lib/translation-cache";
import { aiApiKey, aiModel } from "@/services/ai/provider";
import type { Language, Register, TranslationEngine } from "@/types/translation";

export const runtime = "nodejs";

const langToEnum = { en: "EN", fr: "FR", mfe: "MFE" } as const;

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

/**
 * Streaming translation over NDJSON. Emits a `start` frame (direction +
 * detection), then `chunk` frames as tokens arrive, then a final `done` frame
 * with the grammar-corrected text, engine and cultural note. Falls back to the
 * offline dictionary (as a single chunk) when the AI is unavailable.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`translate:${clientKey(req)}`, 30, 60_000);
  if (!limit.success) {
    return jsonResponse({ error: "Too many requests. Please slow down." }, 429, { "Retry-After": "60" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const parsed = translateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, 400);
  }

  const text = parsed.data.text.trim();
  const requestedSource = parsed.data.source as Language | "auto";
  const target = parsed.data.target as Language;

  const detection = detectLanguage(text);
  const source: Language = requestedSource === "auto" ? detection.language : requestedSource;
  const context = analyzeContext(text, parsed.data.register as Register | undefined);
  const register = context.register;

  // Resolve the session now, in the request scope — reading cookies later, from
  // inside the stream's async continuation, is not reliable.
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      send({ type: "start", sourceText: text, source, target, register, detection });

      let fullText = "";
      let engine: TranslationEngine = "dictionary";
      let culturalNote: string | undefined;

      const model = aiModel();
      const key = cacheKey({ model, source, target, register, text });

      if (aiApiKey()) {
        const cached = await getCachedTranslation(key);
        if (cached) {
          fullText = cached.text;
          engine = "ai";
          culturalNote = cached.culturalNote;
          send({ type: "chunk", text: cached.text });
        } else {
          const streamed = await streamAiTranslation(
            { text, source, target, register, guidance: context.guidance },
            (delta) => send({ type: "chunk", text: delta }),
          );
          if (streamed) {
            fullText = streamed;
            engine = "ai";
            await setCachedTranslation(key, { text: streamed });
          }
        }
      }

      if (!fullText) {
        const dict = translateWithDictionary(text, source, target);
        if (dict) {
          fullText = dict.text;
          culturalNote = dict.note;
        } else {
          fullText = text;
          culturalNote =
            "No offline translation found for this input. Add an OPENAI_API_KEY for full AI coverage.";
        }
        engine = "dictionary";
        send({ type: "chunk", text: fullText });
      }

      fullText = correctGrammar(fullText).text;
      culturalNote = adaptCulturally(target, register, culturalNote).note;

      send({ type: "done", engine, culturalNote, resultText: fullText });

      // Persist history before closing so the write completes on serverless.
      try {
        await prisma.translation.create({
          data: {
            userId,
            sourceText: text,
            resultText: fullText,
            sourceLang: langToEnum[source],
            targetLang: langToEnum[target],
            register: register.toUpperCase() as Uppercase<Register>,
            engine: engine.toUpperCase() as Uppercase<TranslationEngine>,
          },
        });
      } catch {
        // Database not configured — the translation still streamed successfully.
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
