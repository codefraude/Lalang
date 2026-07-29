import type { Language, Register } from "@/types/translation";
import { LANGUAGE_META, REGISTER_META } from "@/types/translation";
import {
  aiApiKey,
  aiModel,
  authHeaders,
  chatCompletionsUrl,
  logProviderFailure,
  samplingParams,
} from "@/services/ai/provider";

/**
 * Streaming AI translation.
 *
 * Same OpenAI-compatible wire format as `ai-translator`, but with `stream: true`
 * and a plain-text prompt (no JSON envelope) so tokens can be forwarded to the
 * client the instant they arrive — turning a 2–15s wait into a live "typing"
 * effect. Returns the full accumulated text, or `null` if the model is
 * unconfigured or fails before producing anything (so the caller can fall back
 * to the dictionary). A cultural note isn't produced on this path — the
 * pipeline's cultural-adaptation stage still attaches a register-based one.
 */

const TIMEOUT_MS = 30_000;

interface StreamInput {
  text: string;
  source: Language;
  target: Language;
  register: Register;
  guidance: string;
}

function buildSystemPrompt(target: Language, register: Register, guidance: string): string {
  const tgt = LANGUAGE_META[target];
  const reg = REGISTER_META[register];
  return [
    `You are an expert translator specialising in the languages of Mauritius:`,
    `English, French and Mauritian Creole (Kreol Morisien).`,
    ``,
    `Translate the user's text into ${tgt.label} (${tgt.nativeLabel}).`,
    `Target register: ${reg.label} — ${reg.hint}. ${guidance}`.trim(),
    ``,
    `Rules:`,
    `- Produce natural, idiomatic ${tgt.nativeLabel}, not a word-for-word calque.`,
    `- Preserve meaning, tone and any local flavour.`,
    `- Use the standard orthography for the target Creole.`,
    `- Respond with ONLY the translated text — no quotes, labels or explanation.`,
  ].join("\n");
}

export async function streamAiTranslation(
  input: StreamInput,
  onDelta: (delta: string) => void,
): Promise<string | null> {
  const apiKey = aiApiKey();
  if (!apiKey) return null;

  const model = aiModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let full = "";
  try {
    const response = await fetch(chatCompletionsUrl(), {
      method: "POST",
      signal: controller.signal,
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model,
        ...samplingParams(model, 0.3),
        stream: true,
        messages: [
          { role: "system", content: buildSystemPrompt(input.target, input.register, input.guidance) },
          { role: "user", content: `Source language: ${LANGUAGE_META[input.source].label}\nText: ${input.text}` },
        ],
      }),
    });

    if (!response.ok || !response.body) {
      await logProviderFailure("ai-stream", response);
      return null;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // OpenAI SSE: newline-separated `data: {json}` frames, ending in [DONE].
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const delta: string | undefined = json?.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
          // Ignore partial/keepalive frames.
        }
      }
    }

    return full.trim() || null;
  } catch (error) {
    console.error("[ai-stream] request failed:", error);
    return full.trim() || null; // keep partial output rather than double-falling-back
  } finally {
    clearTimeout(timeout);
  }
}
