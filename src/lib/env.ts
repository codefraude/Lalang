/**
 * Centralised, typed access to environment configuration.
 *
 * Nothing here throws at import time — the app is designed to boot with only a
 * subset of variables set and light up features as they become available. Use
 * the `*Enabled` flags to gate optional integrations.
 */

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

/** A credential that is present and not an obvious placeholder. */
function isReal(value: string | undefined): boolean {
  const v = clean(value);
  return v.length > 3 && !/^(x+|your-|changeme|placeholder|todo)/i.test(v);
}

export const APP_URL =
  clean(process.env.AUTH_URL) ||
  clean(process.env.NEXT_PUBLIC_APP_URL) ||
  "http://localhost:3000";

export const isProduction = process.env.NODE_ENV === "production";

/** Registrable domain host used as the WebAuthn Relying Party ID. */
export function getRpId(): string {
  try {
    return new URL(APP_URL).hostname;
  } catch {
    return "localhost";
  }
}

/** Full origin (scheme + host + port) expected by WebAuthn verification. */
export function getOrigin(): string {
  try {
    return new URL(APP_URL).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export const googleEnabled =
  isReal(process.env.GOOGLE_CLIENT_ID) && isReal(process.env.GOOGLE_CLIENT_SECRET);

export const googleClientId = clean(process.env.GOOGLE_CLIENT_ID);

export const resendEnabled = isReal(process.env.RESEND_API_KEY);

export const emailFrom = clean(process.env.EMAIL_FROM) || "Lalang <onboarding@resend.dev>";

export const APP_NAME = "Lalang";
