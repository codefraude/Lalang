import bcrypt from "bcryptjs";
import { sha1Upper } from "@/lib/crypto";

/**
 * Password hashing and breach checking.
 *
 * bcrypt (cost 12) is kept for portability (pure-JS, no native build, works on
 * any host and matches the existing hashes). Argon2id is OWASP's first choice —
 * see docs/SECURITY.md for the migration path. bcrypt silently truncates input
 * beyond 72 bytes, so callers must enforce that limit via the Zod schema.
 */

const BCRYPT_COST = 12;

/** A valid bcrypt hash of a random value, for constant-time dummy verifies. */
export const DUMMY_HASH = bcrypt.hashSync("lalang:nonexistent-user:" + Math.random(), BCRYPT_COST);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Check a password against the HaveIBeenPwned "Pwned Passwords" range API using
 * k-anonymity (only the first 5 SHA-1 chars leave the server). Fails OPEN: if
 * the API is unreachable we do not block the user.
 */
export async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const sha1 = sha1Upper(password);
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true", "User-Agent": "lalang-auth" },
      // Don't let a slow third party hang the request.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const body = await res.text();
    for (const line of body.split("\n")) {
      const [suf, count] = line.trim().split(":");
      if (suf === suffix) return Number(count) > 0; // padded rows have count 0
    }
    return false;
  } catch {
    return false;
  }
}
