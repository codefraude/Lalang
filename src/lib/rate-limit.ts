/**
 * Rate limiter with a durable backend when available.
 *
 * On Vercel (and any multi-instance deployment) an in-memory counter resets per
 * cold start and isn't shared across lambdas, so it's not real protection. When
 * `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set we use Upstash
 * Redis (a fixed-window counter over its REST API — no SDK, same style as the
 * other services). Without those env vars, or if a Redis call fails, we fall
 * back to the in-memory limiter so the app still runs everywhere.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const REST_URL = process.env.UPSTASH_REDIS_REST_URL?.trim();
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const redisEnabled = Boolean(REST_URL && REST_TOKEN);

function inMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, bucket);
    return { success: true, remaining: limit - 1, resetAt: bucket.resetAt };
  }

  existing.count += 1;
  const success = existing.count <= limit;
  return {
    success,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/**
 * Fixed-window counter in Redis: INCR the key, set the window TTL only on the
 * first hit (PEXPIRE ... NX), and read the remaining TTL for `resetAt`. One
 * round-trip via the REST pipeline endpoint.
 */
async function viaRedis(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const redisKey = `rl:${key}`;
  const response = await fetch(`${REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["PEXPIRE", redisKey, windowMs, "NX"],
      ["PTTL", redisKey],
    ]),
    // Never let the limiter itself hang a request.
    signal: AbortSignal.timeout(2_000),
  });

  if (!response.ok) throw new Error(`Upstash returned ${response.status}`);

  const results = (await response.json()) as Array<{ result: number }>;
  const count = Number(results[0]?.result ?? 0);
  const pttl = Number(results[2]?.result ?? windowMs);
  const resetAt = Date.now() + (pttl > 0 ? pttl : windowMs);

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

export async function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  if (redisEnabled) {
    try {
      return await viaRedis(key, limit, windowMs);
    } catch (error) {
      console.error("[rate-limit] Redis unavailable, falling back to memory:", error);
    }
  }
  return inMemory(key, limit, windowMs);
}

/** Best-effort client identifier from request headers. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  return ip;
}
