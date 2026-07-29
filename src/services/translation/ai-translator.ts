import type { Language, Register } from "@/types/translation";
import { LANGUAGE_META, REGISTER_META } from "@/types/translation";
import { cacheKey, getCachedTranslation, setCachedTranslation } from "@/lib/translation-cache";
import { aiApiKey, aiModel, authHeaders, chatCompletionsUrl, samplingParams } from "@/services/ai/provider";

/**
 * AI translation stage.
 *
 * Speaks the OpenAI Chat Completions wire format directly via `fetch` (no SDK
 * dependency, keeps the install light and avoids version churn). If
 * `OPENAI_API_KEY` is not set, or the call fails for any reason, this returns
 * `null` so the pipeline can fall back to the offline dictionary. That means the
 * app is fully usable with zero configuration, and simply gets *better* once a
 * key is added.
 *
 * The endpoint is configurable via `OPENAI_BASE_URL`, so any OpenAI-compatible
 * provider works with no code change — including several with free tiers:
 *   - Groq          OPENAI_BASE_URL=https://api.groq.com/openai/v1
 *   - Google Gemini OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
 *   - OpenRouter    OPENAI_BASE_URL=https://openrouter.ai/api/v1
 *   - Mistral       OPENAI_BASE_URL=https://api.mistral.ai/v1
 *   - Ollama (local, no key needed by the server) OPENAI_BASE_URL=http://localhost:11434/v1
 * Set `OPENAI_MODEL` to a model the chosen provider offers. Endpoint, model and
 * per-model body shape all come from `@/services/ai/provider`.
 */

export interface AiTranslation {
  text: string;
  culturalNote?: string;
}

interface AiInput {
  text: string;
  source: Language;
  target: Language;
  register: Register;
  guidance: string;
}

const TIMEOUT_MS = 15_000;

function buildSystemPrompt(target: Language, register: Register): string {
  const tgt = LANGUAGE_META[target];
  const reg = REGISTER_META[register];
  return [
    `You are an expert translator specialising in the languages of Mauritius:`,
    `English, French and Mauritian Creole (Kreol Morisien).`,
    ``,
    `Translate the user's text into ${tgt.label} (${tgt.nativeLabel}).`,
    `Target register: ${reg.label} — ${reg.hint}.`,
    ``,
    `Rules:`,
    `- Produce natural, idiomatic ${tgt.nativeLabel}, not a word-for-word calque.`,
    `- Preserve meaning, tone and any local flavour.`,
    `- Use the standard orthography for the target Creole.`,
    `- Do NOT add quotes, explanations or extra text to the translation itself.`,
    ``,
    `Respond ONLY with strict JSON of the form:`,
    `{"translation": "<the translated text>", "culturalNote": "<one short sentence of nuance, or empty string>"}`,
  ].join("\n");
}

export async function translateWithAi(
  input: AiInput,
): Promise<AiTranslation | null> {
  const apiKey = aiApiKey();
  if (!apiKey) return null;

  const model = aiModel();

  // Identical inputs always translate the same way — serve them from cache
  // instead of re-calling (and re-billing) the model.
  const key = cacheKey({
    model,
    source: input.source,
    target: input.target,
    register: input.register,
    text: input.text,
  });
  const cached = await getCachedTranslation(key);
  if (cached) return cached;

  const endpoint = chatCompletionsUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model,
        ...samplingParams(model, 0.3),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt(input.target, input.register) },
          {
            role: "user",
            content: `Source language: ${LANGUAGE_META[input.source].label}\nText: ${input.text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[ai-translator] OpenAI returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as {
      translation?: string;
      culturalNote?: string;
    };
    if (!parsed.translation) return null;

    const result: AiTranslation = {
      text: parsed.translation.trim(),
      culturalNote: parsed.culturalNote?.trim() || undefined,
    };
    await setCachedTranslation(key, result);
    return result;
  } catch (error) {
    console.error("[ai-translator] request failed:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
