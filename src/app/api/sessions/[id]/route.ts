import { auth } from "@/lib/auth";
import { revokeDeviceSession } from "@/lib/session-store";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, jsonOk, notFound, unauthorized } from "@/lib/api";

/** Revoke a single session. Revoking the current one signs this device out. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  const revoked = await revokeDeviceSession(id, session.user.id);
  if (!revoked) return notFound("Session not found.");

  await writeAudit("session.revoke", {
    userId: session.user.id,
    metadata: { sessionId: id, self: id === session.sid },
    client: getClientInfo(req.headers),
  });
  return jsonOk({ ok: true, self: id === session.sid });
}
