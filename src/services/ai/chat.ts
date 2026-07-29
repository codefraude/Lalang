/**
 * Shared OpenAI-compatible Chat Completions helper (no SDK — same wire format as
 * the translator, so any provider set via OPENAI_BASE_URL works). Returns the
 * assistant message text, or `null` if unconfigured / the call fails, so callers
 * can degrade gracefully.
 */

import { aiApiKey, aiModel, authHeaders, chatCompletionsUrl, samplingParams } from "./provider";

const TIMEOUT_MS = 20_000;

export function aiConfigured(): boolean {
  return Boolean(aiApiKey());
}

export interface ChatOptions {
  system: string;
  user: string;
  json?: boolean;
  temperature?: number;
}

export async function chatComplete(opts: ChatOptions): Promise<string | null> {
  const apiKey = aiApiKey();
  if (!apiKey) return null;

  const model = aiModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(chatCompletionsUrl(), {
      method: "POST",
      signal: controller.signal,
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model,
        ...samplingParams(model, opts.temperature ?? 0.4),
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });
    if (!response.ok) {
      console.error(`[ai] provider returned ${response.status}`);
      return null;
    }
    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    return content?.trim() ?? null;
  } catch (error) {
    console.error("[ai] request failed:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
