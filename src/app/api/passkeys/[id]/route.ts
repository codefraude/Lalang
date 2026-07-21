import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { assertSameOriginOr403, readJson, jsonOk, jsonError, notFound, unauthorized, zodError } from "@/lib/api";

const renameSchema = z.object({ name: z.string().trim().min(1).max(60) });

/** Rename a passkey. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const parsed = renameSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const { id } = await params;
  const result = await prisma.authenticator.updateMany({
    where: { id, userId: session.user.id },
    data: { name: parsed.data.name },
  });
  if (result.count === 0) return notFound("Passkey not found.");
  return jsonOk({ ok: true });
}

/** Remove a passkey. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  const result = await prisma.authenticator.deleteMany({ where: { id, userId: session.user.id } });
  if (result.count === 0) return notFound("Passkey not found.");

  await writeAudit("passkey.remove", { userId: session.user.id, metadata: { passkeyId: id } });
  return jsonOk({ ok: true });
}
