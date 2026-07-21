import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRegistrationOptions, persistChallenge } from "@/lib/webauthn";
import { assertSameOriginOr403, jsonOk, unauthorized } from "@/lib/api";

export const runtime = "nodejs";

/** Registration options for adding a passkey to the signed-in account. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  });
  if (!user) return unauthorized();

  const existing = await prisma.authenticator.findMany({
    where: { userId: user.id },
    select: { credentialId: true, transports: true },
  });

  const options = await buildRegistrationOptions(user, existing);
  await persistChallenge(options.challenge);
  return jsonOk(options);
}
