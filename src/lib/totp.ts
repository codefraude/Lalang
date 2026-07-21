import { randomBytes } from "node:crypto";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { APP_NAME } from "@/lib/env";

/**
 * TOTP (RFC 6238) two-factor auth. SHA1 / 6 digits / 30s for maximum
 * authenticator-app compatibility; ±1 step verification window.
 */

const DIGITS = 6;
const PERIOD = 30;
const WINDOW = 1;

/** New 160-bit base32 secret (persist ENCRYPTED — see lib/crypto). */
export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

function buildTotp(secretBase32: string, accountLabel: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: APP_NAME,
    label: accountLabel,
    algorithm: "SHA1",
    digits: DIGITS,
    period: PERIOD,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

/** otpauth:// provisioning URI for authenticator apps. */
export function totpUri(secretBase32: string, accountLabel: string): string {
  return buildTotp(secretBase32, accountLabel).toString();
}

/** Render a provisioning URI as a PNG data URL for an <img>. */
export function totpQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { errorCorrectionLevel: "M", margin: 2, width: 240 });
}

/**
 * Verify a submitted code. Returns the absolute time-step it matched (for
 * replay protection) or null if invalid. Note: `validate` returns 0 for the
 * current step, so we test for `null` explicitly.
 */
export function verifyTotp(secretBase32: string, token: string): { step: number } | null {
  const totp = buildTotp(secretBase32, APP_NAME);
  const delta = totp.validate({ token: token.replace(/\s/g, ""), window: WINDOW });
  if (delta === null) return null;
  return { step: totp.counter() + delta };
}

// --- Backup / recovery codes ----------------------------------------------

const BACKUP_COUNT = 10;

/** Ten single-use recovery codes formatted `xxxxx-xxxxx`. Show once. */
export function generateBackupCodes(count = BACKUP_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString("hex"); // 10 hex chars ≈ 40 bits
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

export function normalizeBackupCode(code: string): string {
  return code.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(normalizeBackupCode(c), 12)));
}

/**
 * Match an input against stored bcrypt hashes. Iterates all hashes (no early
 * exit that leaks timing) and returns the matched hash, or null.
 */
export async function findMatchingBackupCode(
  input: string,
  storedHashes: string[],
): Promise<string | null> {
  const candidate = normalizeBackupCode(input);
  let matched: string | null = null;
  for (const hash of storedHashes) {
    if (await bcrypt.compare(candidate, hash)) matched = hash;
  }
  return matched;
}
