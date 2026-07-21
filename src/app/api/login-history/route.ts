import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, unauthorized } from "@/lib/api";

/** Recent authentication events (successes, failures, logouts). */
export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const rows = await prisma.loginHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return jsonOk({
    history: rows.map((r) => ({
      id: r.id,
      method: r.method,
      status: r.status,
      reason: r.reason,
      browser: r.browser,
      os: r.os,
      deviceType: r.deviceType,
      ip: r.ip,
      country: r.country,
      city: r.city,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
