import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { issueEmailVerification } from "@/lib/tokens";
import { assertSameOriginOr403, rateOr429, unauthorized, jsonOk } from "@/lib/api";

export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const limited = await rateOr429(req, `verify-resend:${session.user.id}`, 3, 5 * 60_000);
  if (limited) return limited;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });

  // Always return ok to avoid leaking state; only send if needed.
  if (user?.email && !user.emailVerified) {
    await issueEmailVerification({ id: session.user.id, email: user.email });
  }
  return jsonOk({ ok: true });
}
