import { auth } from "@/lib/auth";
import { listDeviceSessions, revokeAllDeviceSessions } from "@/lib/session-store";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, jsonOk, unauthorized } from "@/lib/api";

/** List the user's active device sessions, flagging the current one. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const rows = await listDeviceSessions(session.user.id);
  const sessions = rows.map((s) => ({
    id: s.id,
    method: s.method,
    browser: s.browser,
    os: s.os,
    deviceType: s.deviceType,
    ip: s.ip,
    city: s.city,
    country: s.country,
    rememberMe: s.rememberMe,
    createdAt: s.createdAt.toISOString(),
    lastActiveAt: s.lastActiveAt.toISOString(),
    current: s.id === session.sid,
  }));
  return jsonOk({ sessions, currentSid: session.sid ?? null });
}

/** Revoke all other sessions ("log out everywhere else"). */
export async function DELETE(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const revoked = await revokeAllDeviceSessions(session.user.id, session.sid);
  await writeAudit("session.revoke_others", {
    userId: session.user.id,
    metadata: { revoked },
    client: getClientInfo(req.headers),
  });
  return jsonOk({ ok: true, revoked });
}
