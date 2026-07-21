import { prisma } from "@/lib/prisma";
import { verifyPassword, DUMMY_HASH } from "@/lib/password";
import { verifyTotp, findMatchingBackupCode } from "@/lib/totp";
import { decryptSecret } from "@/lib/crypto";
import { recordLogin } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { emailSchema } from "@/lib/validations/auth";
import { InvalidCredentials, TotpRequired, TotpInvalid } from "@/lib/auth/errors";

/** Coerce Auth.js' string-valued credentials into a boolean. */
function toBool(v: unknown): boolean {
  return v === true || v === "true";
}

/**
 * Email + password sign-in with optional TOTP / backup-code second factor.
 * Records failed attempts to the login history; successful sign-ins are logged
 * from the jwt callback (where the device session is created).
 */
export async function authorizePassword(
  raw: Partial<Record<string, unknown>>,
  request: Request,
) {
  const client = getClientInfo(request.headers);
  const email = emailSchema.safeParse(raw.email);
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!email.success || password.length === 0) {
    throw new InvalidCredentials();
  }

  const user = await prisma.user.findUnique({ where: { email: email.data } });

  // Always run a hash comparison to keep timing uniform for unknown accounts.
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.passwordHash || !passwordOk) {
    await recordLogin({
      email: email.data,
      userId: user?.id ?? null,
      method: "PASSWORD",
      status: "FAILED",
      reason: "invalid_credentials",
      client,
    });
    throw new InvalidCredentials();
  }

  if (user.twoFactorEnabled) {
    await verifySecondFactor(user, raw, client);
  }

  // Signing in reactivates a deactivated account.
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
    rememberMe: toBool(raw.rememberMe),
  };
}

async function verifySecondFactor(
  user: { id: string; totpSecret: string | null; totpLastStep: number | null },
  raw: Partial<Record<string, unknown>>,
  client: ReturnType<typeof getClientInfo>,
) {
  const totp = typeof raw.totp === "string" ? raw.totp.trim() : "";
  const backupCode = typeof raw.backupCode === "string" ? raw.backupCode.trim() : "";

  if (!totp && !backupCode) throw new TotpRequired();

  if (totp && user.totpSecret) {
    const result = verifyTotp(decryptSecret(user.totpSecret), totp);
    if (result && result.step > (user.totpLastStep ?? 0)) {
      await prisma.user.update({ where: { id: user.id }, data: { totpLastStep: result.step } });
      return;
    }
  } else if (backupCode) {
    const codes = await prisma.backupCode.findMany({ where: { userId: user.id, usedAt: null } });
    const matched = await findMatchingBackupCode(backupCode, codes.map((c) => c.codeHash));
    if (matched) {
      const row = codes.find((c) => c.codeHash === matched);
      if (row) await prisma.backupCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
      return;
    }
  }

  await recordLogin({
    userId: user.id,
    method: "TOTP",
    status: "FAILED",
    reason: "invalid_2fa",
    client,
  });
  throw new TotpInvalid();
}
