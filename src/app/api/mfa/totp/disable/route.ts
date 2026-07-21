import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isReauthenticated } from "@/lib/reauth";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, jsonOk, jsonError, unauthorized } from "@/lib/api";

/** Turn off 2FA and destroy the secret + backup codes. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false, totpSecret: null, totpLastStep: null, twoFactorAt: null },
    }),
    prisma.backupCode.deleteMany({ where: { userId: session.user.id } }),
  ]);

  await writeAudit("mfa.disable", { userId: session.user.id, client: getClientInfo(req.headers) });
  return jsonOk({ ok: true });
}
