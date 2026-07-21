/**
 * Shared OpenAI-compatible Chat Completions helper (no SDK — same wire format as
 * the translator, so any provider set via OPENAI_BASE_URL works). Returns the
 * assistant message text, or `null` if unconfigured / the call fails, so callers
 * can degrade gracefully.
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const TIMEOUT_MS = 20_000;

export function aiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export interface ChatOptions {
  system: string;
  user: string;
  json?: boolean;
  temperature?: number;
}

export async function chatComplete(opts: ChatOptions): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const baseUrl = (process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: opts.temperature ?? 0.4,
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
