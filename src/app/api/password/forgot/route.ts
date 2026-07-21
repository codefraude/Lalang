import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { issuePasswordReset } from "@/lib/tokens";
import { getClientIp } from "@/lib/request";
import { assertSameOriginOr403, rateOr429, readJson, jsonOk, zodError } from "@/lib/api";

const GENERIC = { ok: true, message: "If an account exists for that email, we've sent a reset link." };

export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;
  const limited = rateOr429(req, "forgot", 5, 15 * 60_000);
  if (limited) return limited;

  const parsed = forgotPasswordSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user?.email) {
    await issuePasswordReset({ id: user.id, email: user.email }, getClientIp(req.headers));
  }
  // Identical response whether or not the account exists (anti-enumeration).
  return jsonOk(GENERIC);
}
