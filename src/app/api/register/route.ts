import { prisma } from "@/lib/prisma";
import { hashPassword, isPasswordBreached } from "@/lib/password";
import { scorePassword } from "@/lib/password-strength";
import { registerSchema } from "@/lib/validations/auth";
import { ensureUserDefaults } from "@/lib/auth/provisioning";
import { issueEmailVerification } from "@/lib/tokens";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, rateOr429, readJson, jsonOk, jsonError, zodError } from "@/lib/api";

export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;
  const limited = await rateOr429(req, "register", 5, 60_000);
  if (limited) return limited;

  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);
  const { name, email, password } = parsed.data;

  if (scorePassword(password).score < 2) {
    return jsonError("Please choose a stronger password.", 422, { fields: { password: "Too weak." } });
  }
  if (await isPasswordBreached(password)) {
    return jsonError("That password appeared in a data breach — please choose another.", 422, {
      fields: { password: "Found in a breach." },
    });
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return jsonError("An account with this email already exists.", 409, {
      fields: { email: "Already registered." },
    });
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  await ensureUserDefaults(user.id);
  // Sends the verification link. With no RESEND_API_KEY it's logged to the
  // server console (and written to .dev-mail/) instead of emailed, and never
  // throws — so registration always succeeds.
  await issueEmailVerification({ id: user.id, email });
  await writeAudit("user.register", { userId: user.id, client: getClientInfo(req.headers) });

  return jsonOk({ ok: true });
}
