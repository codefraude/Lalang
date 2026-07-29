/**
 * Single source of truth for the OpenAI-compatible provider settings.
 *
 * The model name and base URL used to be repeated at every call site (translator,
 * streaming translator, assistant chat, stream route), which meant a model change
 * had to be made in four places and could silently disagree — the stream route
 * builds the cache key from the model, so a mismatch there splits the cache.
 *
 * It also shapes the request body per model. The GPT-5 / o-series reasoning models
 * reject a custom `temperature` (only the default 1 is accepted) and spend time
 * thinking before the first token, so they get a `reasoning_effort` instead. The
 * `*-chat-latest` variants are not reasoning models and take `temperature`
 * normally. Getting this wrong is a hard 400, not a degraded answer.
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

/**
 * Quality matters more than cost for a language-preservation product, so the
 * default is the flagship rather than a mini. Override with `OPENAI_MODEL` —
 * any model the configured provider offers works, no code change needed.
 */
const DEFAULT_MODEL = "gpt-5.5";

/** Reasoning models are slow by design; a translation needs little deliberation. */
const DEFAULT_REASONING_EFFORT = "low";

export function aiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY || undefined;
}

export function aiModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

export function chatCompletionsUrl(): string {
  const baseUrl = (process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${baseUrl}/chat/completions`;
}

export function authHeaders(apiKey: string): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
}

export function isReasoningModel(model: string): boolean {
  if (model.includes("-chat")) return false;
  return /(^|\/)(o[134]|gpt-5)/.test(model);
}

/**
 * The sampling half of the request body: `temperature` for classic chat models,
 * `reasoning_effort` for the ones that would reject it.
 */
export function samplingParams(model: string, temperature: number): Record<string, unknown> {
  if (isReasoningModel(model)) {
    return { reasoning_effort: process.env.OPENAI_REASONING_EFFORT || DEFAULT_REASONING_EFFORT };
  }
  return { temperature };
}

/**
 * Note shown when neither the AI nor the dictionary could translate the input.
 *
 * These two situations look identical to the user but need opposite actions, and
 * conflating them sends people to configure a key they already have: an unset key
 * is the reader's own setup to fix, whereas a configured key that produced nothing
 * means the provider rejected the call (quota, billing, auth, rate limit) and the
 * reason is in the server log.
 */
export function noCoverageNote(): string {
  if (!aiApiKey()) {
    return "No offline translation found for this input. Add an OPENAI_API_KEY for full AI coverage.";
  }
  return "No offline translation found for this input, and the AI provider rejected the request — check the server log for the reason.";
}

/**
 * Logs a failed provider response with its body. The status alone hides the one
 * detail that identifies the problem — `insufficient_quota` and an invalid key
 * are both plausible causes and are fixed in completely different places.
 */
export async function logProviderFailure(tag: string, response: Response): Promise<void> {
  const detail = await response.text().catch(() => "");
  console.error(`[${tag}] provider returned ${response.status}: ${detail.slice(0, 500)}`);
}
