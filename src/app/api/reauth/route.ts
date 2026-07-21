import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { verifyTotp } from "@/lib/totp";
import { decryptSecret } from "@/lib/crypto";
import { reauthSchema } from "@/lib/validations/auth";
import { markReauthenticated } from "@/lib/reauth";
import { assertSameOriginOr403, rateOr429, readJson, jsonOk, jsonError, zodError, unauthorized } from "@/lib/api";

/** Step-up "sudo mode" — confirm identity before a sensitive action. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const limited = rateOr429(req, `reauth:${session.user.id}`, 5, 5 * 60_000);
  if (limited) return limited;

  const parsed = reauthSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return unauthorized();

  let ok = false;
  if (parsed.data.password && user.passwordHash) {
    ok = await verifyPassword(parsed.data.password, user.passwordHash);
  }
  if (!ok && parsed.data.totp && user.twoFactorEnabled && user.totpSecret) {
    const result = verifyTotp(decryptSecret(user.totpSecret), parsed.data.totp);
    if (result && result.step > (user.totpLastStep ?? 0)) {
      await prisma.user.update({ where: { id: user.id }, data: { totpLastStep: result.step } });
      ok = true;
    }
  }

  if (!ok) return jsonError("That didn't match. Please try again.", 422);

  await markReauthenticated(user.id);
  return jsonOk({ ok: true });
}
