import { UAParser } from "ua-parser-js";

/** A minimal, header-bag-agnostic view (Web `Headers` or Next `ReadonlyHeaders`). */
export interface HeaderBag {
  get(name: string): string | null | undefined;
}

export interface ClientInfo {
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string; // desktop | mobile | tablet | ...
}

/** Best-effort client IP from proxy headers. */
export function getClientIp(headers: HeaderBag): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return headers.get("x-real-ip")?.trim() || null;
}

/** Parse device/browser/OS + IP from a request's headers. */
export function getClientInfo(headers: HeaderBag): ClientInfo {
  const userAgent = headers.get("user-agent") ?? null;
  const parsed = userAgent ? new UAParser(userAgent).getResult() : null;
  return {
    ip: getClientIp(headers),
    userAgent,
    browser: parsed?.browser.name ?? null,
    os: parsed?.os.name ?? null,
    deviceType: parsed?.device.type ?? "desktop",
  };
}

/** Human label for a device session, e.g. "Chrome on macOS". */
export function describeDevice(info: {
  browser: string | null;
  os: string | null;
}): string {
  const { browser, os } = info;
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? "Unknown device";
}

/**
 * Same-origin / CSRF check for our own mutating Route Handlers. Auth.js only
 * protects its own `/api/auth/*` routes, so every other POST/PATCH/DELETE must
 * verify the request did not originate cross-site. Uses `Sec-Fetch-Site` where
 * available and falls back to an `Origin`↔`Host` comparison.
 */
export function isSameOrigin(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "same-site" || site === "none";

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  // No signalling headers (server-to-server, tests) — allow.
  return true;
}
