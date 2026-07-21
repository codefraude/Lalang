# Security decisions

OWASP-aligned controls implemented in the Lalang authentication system, with the
rationale and the file where each lives.

## Passwords

- **Hashing**: bcrypt, cost **12** (`lib/password.ts`). Chosen over Argon2id for
  portability — pure JS, no native build, and it matches existing hashes. Argon2id
  is OWASP's first choice; migrating is a drop-in replacement in `hashPassword` /
  `verifyPassword` if a native runtime is acceptable.
- **Length**: min 8, **max 72 bytes** (bcrypt's silent-truncation limit) enforced
  in the Zod schema. No composition rules — length + a breach check is stronger.
- **Breach check**: every new/changed/reset password is checked against
  HaveIBeenPwned via the **k-anonymity range API** (only the first 5 SHA-1 chars
  leave the server). Fails **open** if HIBP is unreachable (`isPasswordBreached`).
- **Strength**: a live meter gates weak passwords (score ≥ 2 required server-side).

## Sessions & cookies

- **Strategy**: JWT (required by Credentials), made revocable via a
  `DeviceSession` row checked on every read (`lib/session-store.ts`).
- **Lifetimes**: 12 h default, 30 days with "remember me", enforced by
  `DeviceSession.expiresAt` (independent of the cookie's `maxAge`).
- **Rotation / invalidation**: password **reset** revokes all sessions; **change**
  keeps the current device; "log out everywhere" revokes the rest.
- **Cookies**: `httpOnly`, `sameSite=lax`, `Secure` + `__Secure-`/`__Host-`
  prefixes in production (`useSecureCookies`). Lax (not Strict) is deliberate so
  the OAuth redirect leg carries the cookie.

## Re-authentication ("sudo mode")

Sensitive actions (change password/email, manage 2FA, delete/deactivate) require
a recent authentication: signed in within **15 minutes**, or a fresh challenge
that sets a short-lived signed cookie (`lib/reauth.ts`). Routes return
`403 { code: "reauth_required" }`; the client prompts and retries transparently
(`ReauthProvider`).

## Two-factor authentication

- **TOTP**: SHA1 / 6 digits / 30 s (max authenticator-app compatibility),
  verified with a ±1 step window (`lib/totp.ts`).
- **Secret at rest**: AES-256-GCM sealed (`lib/crypto.ts`); the key comes from
  `TOTP_ENC_KEY` (or is derived from `AUTH_SECRET`), kept out of the database.
- **Verify-before-enable**: a valid code is required before 2FA is switched on,
  preventing lock-out from a mis-scanned QR.
- **Replay guard**: the last accepted time-step (`User.totpLastStep`) is stored;
  codes at or below it are rejected.
- **Backup codes**: ten single-use codes, bcrypt-hashed, matched in constant time
  over all hashes (no early-exit timing leak).

## Passkeys (WebAuthn)

- SimpleWebAuthn v13; credentials stored per-user (`Authenticator`), public key as
  `Bytes`, signature counter bumped after every login (replay defense).
- Single-use challenge kept in a short-lived `httpOnly` cookie, never trusted from
  the client. `rpID`/origin derived from `AUTH_URL`.

## Tokens (verification / reset / email change)

- 256-bit random tokens; only their **SHA-256 hash** is stored, the raw value is
  emailed (`lib/tokens.ts`). Single-use (`usedAt`) with short TTLs — reset 30 min,
  email-change 1 h, verification 24 h. Issuing a new token invalidates prior ones.

## CSRF

- Auth.js protects its own `/api/auth/*` routes. Every other mutating route calls
  `assertSameOriginOr403` (`Sec-Fetch-Site` / `Origin` ↔ `Host`) and expects a
  JSON body with an `X-Requested-With` header the client sets — cross-site JS
  can't forge either without a preflight.

## Enumeration & brute-force

- **Forgot-password** returns an identical 200 response whether or not the account
  exists; **login** runs a dummy bcrypt compare for unknown emails to keep timing
  uniform.
- **Rate limiting** on register, login, verify, reset, reauth and MFA endpoints
  (`lib/api.ts`, per-scope + IP). Note: the limiter is in-memory (single instance);
  swap for Redis/Upstash for horizontal scaling.

## Account linking

- Google linking uses `allowDangerousEmailAccountLinking` **plus** a `signIn`
  callback that requires `email_verified === true` — safe because Google verifies
  emails. Unlinking refuses to remove the last remaining sign-in method.

## Auditing

- Every sensitive action is written to `AuditLog` (survives account deletion via
  `SetNull`); every auth attempt (success/failure/logout) to `LoginHistory`. A
  "new device" sign-in triggers a security-alert email (unless opted out).

## Known limitations / next steps

- In-memory rate limiter → move to a shared store for multi-instance deploys.
- bcrypt → Argon2id when a native runtime is guaranteed.
- No phone/SMS verification (out of scope this pass).
