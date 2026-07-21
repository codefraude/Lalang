import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccount } from "@/lib/account";
import { isReauthenticated } from "@/lib/reauth";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, readJson, jsonOk, jsonError, unauthorized, notFound } from "@/lib/api";

/** Full account snapshot (for client-side refetch). */
export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const account = await getAccount(session.user.id);
  if (!account) return notFound("Account not found.");
  return jsonOk(account);
}

/** Permanently delete the account and all associated data. */
export async function DELETE(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!(await isReauthenticated(session))) {
    return jsonError("Please confirm your identity to continue.", 403, { code: "reauth_required" });
  }

  const body = (await readJson(req)) as { confirm?: string } | null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, username: true },
  });
  const expected = user?.email ?? user?.username ?? "";
  if (!body?.confirm || body.confirm.toLowerCase() !== expected.toLowerCase()) {
    return jsonError("Type your email exactly to confirm deletion.", 422, {
      fields: { confirm: "Doesn't match your email." },
    });
  }

  // Audit persists (AuditLog.userId is SetNull on delete).
  await writeAudit("account.delete", {
    userId: session.user.id,
    metadata: { email: user?.email ?? null },
    client: getClientInfo(req.headers),
  });
  await prisma.user.delete({ where: { id: session.user.id } });

  return jsonOk({ ok: true });
}
