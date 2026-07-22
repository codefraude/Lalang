/**
 * Cache for AI translation results.
 *
 * The AI stage is the slow, billable part of the pipeline — and identical
 * inputs (same text, direction and register) always produce the same output, so
 * they should never re-hit the model. Two tiers:
 *
 *   1. an in-process LRU — instant, free, but per-instance (limited on
 *      serverless where lambdas are short-lived);
 *   2. Upstash Redis (if `UPSTASH_REDIS_REST_URL` + token are set) — shared
 *      across instances and warm across cold starts.
 *
 * Both are optional: with neither, callers just always compute fresh.
 */

export interface CachedTranslation {
  text: string;
  culturalNote?: string;
}

const MAX_ENTRIES = 500;
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const memory = new Map<string, CachedTranslation>();

const REST_URL = process.env.UPSTASH_REDIS_REST_URL?.trim();
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const redisEnabled = Boolean(REST_URL && REST_TOKEN);

/**
 * A dependency-free 64-bit hash (two independent 32-bit FNV-1a passes) rendered
 * as hex. Avoids `node:crypto` so this module bundles for any runtime, and 64
 * bits makes a cache-key collision (which would return a wrong translation)
 * vanishingly unlikely.
 */
function hash64(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0xc9dc5118;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca77);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

export function cacheKey(parts: {
  model: string;
  source: string;
  target: string;
  register: string;
  text: string;
}): string {
  const hash = hash64(`${parts.model} ${parts.source} ${parts.target} ${parts.register} ${parts.text}`);
  return `tr:v1:${parts.source}:${parts.target}:${parts.register}:${hash}`;
}

function memoryGet(key: string): CachedTranslation | null {
  const hit = memory.get(key);
  if (!hit) return null;
  memory.delete(key); // refresh recency (LRU)
  memory.set(key, hit);
  return hit;
}

function memorySet(key: string, value: CachedTranslation): void {
  if (memory.size >= MAX_ENTRIES) {
    const oldest = memory.keys().next().value as string | undefined;
    if (oldest) memory.delete(oldest);
  }
  memory.set(key, value);
}

async function redisCommand(command: unknown[]): Promise<unknown> {
  const response = await fetch(`${REST_URL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(2_000),
  });
  if (!response.ok) throw new Error(`Upstash returned ${response.status}`);
  const data = (await response.json()) as { result?: unknown };
  return data.result ?? null;
}

export async function getCachedTranslation(key: string): Promise<CachedTranslation | null> {
  const local = memoryGet(key);
  if (local) return local;

  if (!redisEnabled) return null;
  try {
    const raw = (await redisCommand(["GET", key])) as string | null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedTranslation;
    memorySet(key, parsed); // promote into the fast tier
    return parsed;
  } catch (error) {
    console.error("[translation-cache] Redis read failed:", error);
    return null;
  }
}

export async function setCachedTranslation(key: string, value: CachedTranslation): Promise<void> {
  memorySet(key, value);
  if (!redisEnabled) return;
  try {
    await redisCommand(["SET", key, JSON.stringify(value), "EX", TTL_SECONDS]);
  } catch (error) {
    console.error("[translation-cache] Redis write failed:", error);
  }
}
