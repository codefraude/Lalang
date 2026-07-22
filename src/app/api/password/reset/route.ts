import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordBreached } from "@/lib/password";
import { scorePassword } from "@/lib/password-strength";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { consumePasswordReset } from "@/lib/tokens";
import { revokeAllDeviceSessions } from "@/lib/session-store";
import { writeAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/mail/send";
import { passwordChangedEmail } from "@/lib/mail/templates";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, rateOr429, readJson, jsonOk, jsonError, zodError } from "@/lib/api";

export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;
  const limited = await rateOr429(req, "reset", 5, 15 * 60_000);
  if (limited) return limited;

  const parsed = resetPasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);
  const { token, password } = parsed.data;

  if (scorePassword(password).score < 2) {
    return jsonError("Please choose a stronger password.", 422, { fields: { password: "Too weak." } });
  }
  if (await isPasswordBreached(password)) {
    return jsonError("That password appeared in a data breach — please choose another.", 422, {
      fields: { password: "Found in a breach." },
    });
  }

  const result = await consumePasswordReset(token);
  if (!result) return jsonError("This reset link is invalid or has expired.", 400);

  const user = await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash: await hashPassword(password) },
    select: { email: true },
  });
  // Invalidate every existing session after a reset (OWASP).
  await revokeAllDeviceSessions(result.userId);
  await writeAudit("password.reset", { userId: result.userId, client: getClientInfo(req.headers) });
  if (user.email) await sendEmail(user.email, passwordChangedEmail());

  return jsonOk({ ok: true });
}
