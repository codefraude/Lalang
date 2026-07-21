import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, totpUri, totpQrDataUrl } from "@/lib/totp";
import { encryptSecret } from "@/lib/crypto";
import { isReauthenticated } from "@/lib/reauth";
import { assertSameOriginOr403, jsonOk, jsonError, unauthorized } from "@/lib/api";

/** Begin TOTP enrollment: generate a pending secret and return its QR code. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return unauthorized();
  if (user.twoFactorEnabled) return jsonError("Two-factor auth is already enabled.", 409);

  const secret = generateTotpSecret();
  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: encryptSecret(secret) }, // pending until confirmed
  });

  const label = user.email ?? user.id;
  const uri = totpUri(secret, label);
  return jsonOk({ secret, qrDataUrl: await totpQrDataUrl(uri) });
}
