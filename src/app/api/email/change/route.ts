import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { emailSchema } from "@/lib/validations/auth";
import { issueEmailChange } from "@/lib/tokens";
import { isReauthenticated } from "@/lib/reauth";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, rateOr429, readJson, jsonOk, jsonError, zodError, unauthorized } from "@/lib/api";

const schema = z.object({ newEmail: emailSchema, password: z.string().optional() });

/** Request an email change — sends a confirmation link to the NEW address. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }
  const limited = rateOr429(req, `email-change:${session.user.id}`, 3, 15 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);
  const { newEmail, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return unauthorized();

  // If the account has a password, require it as a second confirmation.
  if (user.passwordHash) {
    if (!password || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Your password is incorrect.", 422, { fields: { password: "Incorrect password." } });
    }
  }
  if (newEmail === user.email) {
    return jsonError("That's already your email.", 422, { fields: { newEmail: "No change." } });
  }
  const taken = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } });
  if (taken) {
    return jsonError("That email is already in use.", 409, { fields: { newEmail: "Already in use." } });
  }

  await issueEmailChange(session.user.id, newEmail);
  await writeAudit("email.change.request", {
    userId: session.user.id,
    metadata: { newEmail },
    client: getClientInfo(req.headers),
  });
  return jsonOk({ ok: true });
}
