import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/env";
import { randomToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/lib/mail/send";
import {
  verificationEmail,
  passwordResetEmail,
  emailChangeEmail,
} from "@/lib/mail/templates";

const MINUTE = 60_000;
const VERIFY_TTL = 24 * 60 * MINUTE;
const RESET_TTL = 30 * MINUTE;
const EMAIL_CHANGE_TTL = 60 * MINUTE;

function expiry(ms: number): Date {
  return new Date(Date.now() + ms);
}

function link(path: string, raw: string): string {
  return `${APP_URL}${path}?token=${encodeURIComponent(raw)}`;
}

// --- Email verification ----------------------------------------------------

/** Create a verification token and email the link. Replaces prior tokens. */
export async function issueEmailVerification(user: { id: string; email: string }): Promise<void> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const raw = randomToken();
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: expiry(VERIFY_TTL) },
  });
  await sendEmail(user.email, verificationEmail(link("/verify-email", raw)));
}

/** Consume a verification token: marks the user's email verified. */
export async function consumeEmailVerification(raw: string): Promise<{ userId: string } | null> {
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(raw) },
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;

  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: row.userId }, data: { emailVerified: new Date() } }),
  ]);
  return { userId: row.userId };
}

// --- Password reset --------------------------------------------------------

export async function issuePasswordReset(
  user: { id: string; email: string },
  ip: string | null,
): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const raw = randomToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(raw), expiresAt: expiry(RESET_TTL), ip },
  });
  await sendEmail(user.email, passwordResetEmail(link("/reset-password", raw)));
}

/** Validate a reset token without consuming it (for the reset page to preflight). */
export async function checkPasswordReset(raw: string): Promise<boolean> {
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  return !!row && !row.usedAt && row.expiresAt >= new Date();
}

/** Consume a reset token and return the target user id. */
export async function consumePasswordReset(raw: string): Promise<{ userId: string } | null> {
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  await prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return { userId: row.userId };
}

// --- Email change ----------------------------------------------------------

export async function issueEmailChange(userId: string, newEmail: string): Promise<void> {
  await prisma.emailChangeToken.deleteMany({ where: { userId, usedAt: null } });
  const raw = randomToken();
  await prisma.emailChangeToken.create({
    data: { userId, newEmail, tokenHash: hashToken(raw), expiresAt: expiry(EMAIL_CHANGE_TTL) },
  });
  await sendEmail(newEmail, emailChangeEmail(link("/verify-email-change", raw)));
}

/** Consume an email-change token and apply the new address. */
export async function consumeEmailChange(
  raw: string,
): Promise<{ userId: string; newEmail: string } | null> {
  const row = await prisma.emailChangeToken.findUnique({ where: { tokenHash: hashToken(raw) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;

  // Guard against the address being claimed between request and confirmation.
  const taken = await prisma.user.findUnique({ where: { email: row.newEmail } });
  if (taken && taken.id !== row.userId) return null;

  await prisma.$transaction([
    prisma.emailChangeToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.user.update({
      where: { id: row.userId },
      data: { email: row.newEmail, emailVerified: new Date() },
    }),
  ]);
  return { userId: row.userId, newEmail: row.newEmail };
}
