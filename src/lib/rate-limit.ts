/**
 * Minimal in-memory rate limiter.
 *
 * Good enough for a single-instance dev/small-deployment setup. For horizontal
 * scaling swap this for a shared store (Upstash Redis, etc.) — the interface
 * can stay identical.
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

export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000,
): RateLimitResult {
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

/** Best-effort client identifier from request headers. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  return ip;
}
