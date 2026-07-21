import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotp, generateBackupCodes, hashBackupCodes } from "@/lib/totp";
import { decryptSecret } from "@/lib/crypto";
import { isReauthenticated } from "@/lib/reauth";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, readJson, jsonOk, jsonError, zodError, unauthorized } from "@/lib/api";

const schema = z.object({ token: z.string().trim().min(6).max(10) });

/** Confirm enrollment with a valid code, enable 2FA, and issue backup codes. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.totpSecret) return jsonError("Start setup first.", 400);
  if (user.twoFactorEnabled) return jsonError("Two-factor auth is already enabled.", 409);

  const result = verifyTotp(decryptSecret(user.totpSecret), parsed.data.token);
  if (!result) return jsonError("That code is incorrect. Try the current one.", 422);

  const codes = generateBackupCodes();
  const hashes = await hashBackupCodes(codes);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true, twoFactorAt: new Date(), totpLastStep: result.step },
    }),
    prisma.backupCode.deleteMany({ where: { userId: user.id } }),
    prisma.backupCode.createMany({ data: hashes.map((codeHash) => ({ userId: user.id, codeHash })) }),
  ]);

  await writeAudit("mfa.enable", { userId: user.id, client: getClientInfo(req.headers) });
  return jsonOk({ ok: true, backupCodes: codes });
}
