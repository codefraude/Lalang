import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { isSameOrigin } from "@/lib/request";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/** Standard JSON success response. */
export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

/** Standard JSON error response with a stable shape. */
export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export const unauthorized = () => jsonError("You must be signed in.", 401);
export const forbidden = (message = "You don't have access to that.") => jsonError(message, 403);
export const notFound = (message = "Not found.") => jsonError(message, 404);
export const serverError = (message = "Something went wrong. Please try again.") =>
  jsonError(message, 500);

/** 422 response from a Zod parse failure, with per-field messages. */
export function zodError(error: ZodError): NextResponse {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return jsonError("Please check the highlighted fields.", 422, { fields });
}

/** CSRF guard for mutating routes — returns a 403 response if cross-origin. */
export function assertSameOriginOr403(req: Request): NextResponse | null {
  return isSameOrigin(req) ? null : forbidden("Cross-origin request blocked.");
}

/**
 * Fixed-window rate limit. Returns a 429 response when exceeded, else null.
 * `scope` namespaces the bucket; the client IP is appended automatically.
 */
export async function rateOr429(
  req: Request,
  scope: string,
  max: number,
  windowMs: number,
): Promise<NextResponse | null> {
  const result = await rateLimit(`${scope}:${clientKey(req)}`, max, windowMs);
  if (result.success) return null;
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return jsonError("Too many requests. Please slow down and try again.", 429, { retryAfter });
}

/** Read and JSON-parse a request body, tolerating an empty/invalid body. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
