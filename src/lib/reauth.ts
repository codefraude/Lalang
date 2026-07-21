import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isProduction } from "@/lib/env";

/**
 * "Sudo mode": sensitive actions (change password/email, manage 2FA, delete
 * account) require a recent authentication. This is satisfied either by having
 * signed in within the window, or by passing an explicit re-auth challenge,
 * which sets a short-lived signed cookie.
 */

const SUDO_COOKIE = "lalang_sudo";
export const SUDO_WINDOW_S = 15 * 60;

function sign(payload: string): string {
  const secret = (process.env.AUTH_SECRET ?? "").trim();
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** Mark the user as freshly re-authenticated for the sudo window. */
export async function markReauthenticated(userId: string): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + SUDO_WINDOW_S;
  const payload = `${userId}.${expires}`;
  const value = `${expires}.${sign(payload + `.${userId}`)}`;
  const store = await cookies();
  store.set(SUDO_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: SUDO_WINDOW_S,
  });
}

async function hasValidSudoCookie(userId: string): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(SUDO_COOKIE)?.value;
  if (!raw) return false;
  const [expiresStr, mac] = raw.split(".");
  const expires = Number(expiresStr);
  if (!expires || expires < Math.floor(Date.now() / 1000) || !mac) return false;
  const expected = sign(`${userId}.${expires}.${userId}`);
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * True if the user may perform a sensitive action right now — either they
 * signed in within the sudo window, or they passed a re-auth challenge.
 */
export async function isReauthenticated(session: {
  user: { id: string };
  authAt?: number;
}): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  if (session.authAt && now - session.authAt < SUDO_WINDOW_S) return true;
  return hasValidSudoCookie(session.user.id);
}
