import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, isPasswordBreached } from "@/lib/password";
import { scorePassword } from "@/lib/password-strength";
import { changePasswordSchema } from "@/lib/validations/auth";
import { revokeAllDeviceSessions } from "@/lib/session-store";
import { writeAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/mail/send";
import { passwordChangedEmail } from "@/lib/mail/templates";
import { isReauthenticated } from "@/lib/reauth";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, readJson, jsonOk, jsonError, zodError, unauthorized } from "@/lib/api";

export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }

  const parsed = changePasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return jsonError("Your current password is incorrect.", 422, {
      fields: { currentPassword: "Incorrect password." },
    });
  }
  if (scorePassword(newPassword).score < 2) {
    return jsonError("Please choose a stronger password.", 422, { fields: { newPassword: "Too weak." } });
  }
  if (await isPasswordBreached(newPassword)) {
    return jsonError("That password appeared in a data breach — please choose another.", 422, {
      fields: { newPassword: "Found in a breach." },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  // Keep the current device signed in; drop the others.
  await revokeAllDeviceSessions(user.id, session.sid);
  await writeAudit("password.change", { userId: user.id, client: getClientInfo(req.headers) });
  if (user.email) await sendEmail(user.email, passwordChangedEmail());

  return jsonOk({ ok: true });
}
