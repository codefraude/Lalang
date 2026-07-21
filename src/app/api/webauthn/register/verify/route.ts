import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRegistration, readChallenge, clearChallenge } from "@/lib/webauthn";
import { writeAudit } from "@/lib/audit";
import { assertSameOriginOr403, readJson, jsonOk, jsonError, unauthorized } from "@/lib/api";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";

export const runtime = "nodejs";

/** Verify a passkey registration and persist the credential. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = (await readJson(req)) as { response?: RegistrationResponseJSON; name?: string } | null;
  const challenge = await readChallenge();
  if (!body?.response || !challenge) return jsonError("Registration expired. Please try again.", 400);

  let verification;
  try {
    verification = await verifyRegistration(body.response, challenge);
  } catch {
    return jsonError("Could not verify the passkey.", 400);
  }
  if (!verification.verified || !verification.registrationInfo) {
    return jsonError("Could not verify the passkey.", 400);
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  const exists = await prisma.authenticator.findUnique({ where: { credentialId: credential.id } });
  if (exists) {
    await clearChallenge();
    return jsonError("This passkey is already registered.", 409);
  }

  await prisma.authenticator.create({
    data: {
      userId: session.user.id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports ?? [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 60) : null,
    },
  });
  await clearChallenge();
  await writeAudit("passkey.register", { userId: session.user.id });

  return jsonOk({ ok: true });
}
