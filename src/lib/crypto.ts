import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/**
 * Cryptographic helpers for tokens and secret storage.
 *
 * - Verification/reset tokens are high-entropy random values: we email the raw
 *   token and persist only its SHA-256 (fast hash is correct here — no KDF).
 * - The TOTP shared secret is low-value-if-leaked but must be protected at
 *   rest, so it is sealed with AES-256-GCM (authenticated encryption).
 */

/** Cryptographically-random, URL-safe token (default 256 bits of entropy). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** SHA-256 hex digest — used to store a hash of a raw token. */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** SHA-1 hex (uppercase) — only for the HIBP k-anonymity range API. */
export function sha1Upper(input: string): string {
  return createHash("sha1").update(input, "utf8").digest("hex").toUpperCase();
}

/** Constant-time comparison of two hex strings. */
export function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * 32-byte key for AES-256-GCM. Prefers a dedicated TOTP_ENC_KEY (base64), and
 * otherwise derives a stable key from AUTH_SECRET so 2FA works out of the box
 * in development. In production, set a dedicated key kept off the DB host.
 */
function getEncKey(): Buffer {
  const raw = (process.env.TOTP_ENC_KEY ?? "").trim();
  if (raw) {
    const key = Buffer.from(raw, "base64");
    if (key.length === 32) return key;
  }
  const secret = (process.env.AUTH_SECRET ?? "").trim();
  if (!secret) {
    throw new Error("TOTP_ENC_KEY or AUTH_SECRET must be set to use encryption.");
  }
  return createHash("sha256").update(`lalang:totp:${secret}`).digest();
}

/** Seal a UTF-8 secret → base64(iv | authTag | ciphertext). */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/** Reverse of {@link encryptSecret}. Throws if the blob was tampered with. */
export function decryptSecret(blob: string): string {
  const buf = Buffer.from(blob, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getEncKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
