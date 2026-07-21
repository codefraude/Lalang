import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revokeAllDeviceSessions } from "@/lib/session-store";
import { isReauthenticated } from "@/lib/reauth";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, jsonOk, jsonError, unauthorized } from "@/lib/api";

/** Deactivate the account. Sign-in later reactivates it automatically. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { status: "DEACTIVATED", deactivatedAt: new Date() },
  });
  await revokeAllDeviceSessions(session.user.id);
  await writeAudit("account.deactivate", {
    userId: session.user.id,
    client: getClientInfo(req.headers),
  });

  return jsonOk({ ok: true });
}
