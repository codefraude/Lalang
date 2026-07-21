import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Coarse route guard: redirect unauthenticated users away from /account before
 * the page renders. This only checks for the presence of a session cookie (so
 * it stays edge-safe — no Prisma / bcrypt). The real authorization + session
 * revocation check happens server-side in the account layout via `auth()`.
 *
 * Next 15 uses `middleware.ts`; on Next 16 this convention is renamed to
 * `proxy.ts` (run `npx @next/codemod middleware-to-proxy` when upgrading).
 */
export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
