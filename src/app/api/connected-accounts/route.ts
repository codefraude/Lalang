import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { getClientInfo } from "@/lib/request";
import { assertSameOriginOr403, jsonOk, jsonError, unauthorized } from "@/lib/api";

/** List linked OAuth providers alongside whether a password is set. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const [accounts, user] = await Promise.all([
    prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true, createdAt: true },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } }),
  ]);

  return jsonOk({
    accounts: accounts.map((a) => ({ provider: a.provider, connectedAt: a.createdAt.toISOString() })),
    hasPassword: !!user?.passwordHash,
  });
}

/** Unlink a provider, refusing if it would lock the user out. */
export async function DELETE(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const provider = new URL(req.url).searchParams.get("provider");
  if (!provider) return jsonError("Missing provider.", 422);

  const [accountCount, user] = await Promise.all([
    prisma.account.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } }),
  ]);

  // Don't allow removing the last sign-in method.
  if (!user?.passwordHash && accountCount <= 1) {
    return jsonError("Set a password before removing your only sign-in method.", 409, {
      code: "last_method",
    });
  }

  await prisma.account.deleteMany({ where: { userId: session.user.id, provider } });
  await writeAudit("account.unlink", {
    userId: session.user.id,
    metadata: { provider },
    client: getClientInfo(req.headers),
  });
  return jsonOk({ ok: true });
}
