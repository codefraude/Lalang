import { cookies } from "next/headers";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { getRpId, getOrigin, APP_NAME, isProduction } from "@/lib/env";

const CHALLENGE_COOKIE = "lalang_webauthn_challenge";
const CHALLENGE_TTL = 300; // 5 minutes

// --- Challenge storage (short-lived httpOnly cookie, single-use) ------------

export async function persistChallenge(challenge: string): Promise<void> {
  const store = await cookies();
  store.set(CHALLENGE_COOKIE, challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: CHALLENGE_TTL,
  });
}

export async function readChallenge(): Promise<string | null> {
  const store = await cookies();
  return store.get(CHALLENGE_COOKIE)?.value ?? null;
}

/** Read the challenge from a raw request (usable inside Credentials authorize). */
export function readChallengeFromRequest(req: Request): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CHALLENGE_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function clearChallenge(): Promise<void> {
  const store = await cookies();
  store.delete(CHALLENGE_COOKIE);
}

// --- Registration ----------------------------------------------------------

export async function buildRegistrationOptions(
  user: { id: string; email: string | null; name: string | null },
  existing: { credentialId: string; transports: string[] }[],
) {
  return generateRegistrationOptions({
    rpName: APP_NAME,
    rpID: getRpId(),
    userName: user.email ?? user.id,
    userDisplayName: user.name ?? user.email ?? "Lalang user",
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });
}

export function verifyRegistration(response: RegistrationResponseJSON, expectedChallenge: string) {
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: getOrigin(),
    expectedRPID: getRpId(),
  });
}

// --- Authentication (usernameless / discoverable) --------------------------

export async function buildAuthenticationOptions() {
  return generateAuthenticationOptions({ rpID: getRpId(), userVerification: "preferred" });
}

export function verifyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  credential: { credentialId: string; publicKey: Uint8Array; counter: number; transports: string[] },
) {
  // Copy into a fresh ArrayBuffer-backed view (Prisma Bytes → Buffer is typed
  // over ArrayBufferLike, which the verifier's Uint8Array<ArrayBuffer> rejects).
  const publicKey = new Uint8Array(credential.publicKey.byteLength);
  publicKey.set(credential.publicKey);

  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: getOrigin(),
    expectedRPID: getRpId(),
    requireUserVerification: false,
    credential: {
      id: credential.credentialId,
      publicKey,
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransportFuture[],
    },
  });
}
