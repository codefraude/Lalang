import { prisma } from "@/lib/prisma";
import { verifyAuthentication, readChallengeFromRequest } from "@/lib/webauthn";
import { WebauthnFailed } from "@/lib/auth/errors";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";

/**
 * Passwordless sign-in with a passkey. The client runs `startAuthentication`
 * and passes the assertion JSON here via `signIn('passkey', { response })`.
 * The challenge travels in an httpOnly cookie set by the options endpoint.
 */
export async function authorizePasskey(
  raw: Partial<Record<string, unknown>>,
  request: Request,
) {
  const challenge = readChallengeFromRequest(request);
  if (!challenge || typeof raw.response !== "string") throw new WebauthnFailed();

  let response: AuthenticationResponseJSON;
  try {
    response = JSON.parse(raw.response);
  } catch {
    throw new WebauthnFailed();
  }

  const authenticator = await prisma.authenticator.findUnique({
    where: { credentialId: response.id },
    include: { user: true },
  });
  if (!authenticator) throw new WebauthnFailed();

  let verification;
  try {
    verification = await verifyAuthentication(response, challenge, {
      credentialId: authenticator.credentialId,
      publicKey: new Uint8Array(authenticator.publicKey),
      counter: authenticator.counter,
      transports: authenticator.transports,
    });
  } catch {
    throw new WebauthnFailed();
  }
  if (!verification.verified) throw new WebauthnFailed();

  await prisma.authenticator.update({
    where: { id: authenticator.id },
    data: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
  });

  const { user } = authenticator;
  if (user.status === "DEACTIVATED") {
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE", deactivatedAt: null },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    rememberMe: true,
  };
}
