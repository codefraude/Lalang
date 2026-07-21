import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBackupCodes, hashBackupCodes } from "@/lib/totp";
import { isReauthenticated } from "@/lib/reauth";
import { writeAudit } from "@/lib/audit";
import { assertSameOriginOr403, jsonOk, jsonError, unauthorized } from "@/lib/api";

/** Regenerate the set of one-time backup codes (invalidates the old set). */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });
  if (!user?.twoFactorEnabled) return jsonError("Enable two-factor auth first.", 409);

  const codes = generateBackupCodes();
  const hashes = await hashBackupCodes(codes);
  await prisma.$transaction([
    prisma.backupCode.deleteMany({ where: { userId: session.user.id } }),
    prisma.backupCode.createMany({
      data: hashes.map((codeHash) => ({ userId: session.user.id, codeHash })),
    }),
  ]);

  await writeAudit("mfa.backup_regenerate", { userId: session.user.id });
  return jsonOk({ ok: true, backupCodes: codes });
}
