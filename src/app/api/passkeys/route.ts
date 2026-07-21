import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, unauthorized } from "@/lib/api";

/** List the user's registered passkeys. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const rows = await prisma.authenticator.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      deviceType: true,
      backedUp: true,
      transports: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  return jsonOk({
    passkeys: rows.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      lastUsedAt: p.lastUsedAt?.toISOString() ?? null,
    })),
  });
}
