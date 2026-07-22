import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { suggestionModerateSchema } from "@/utils/validation";
import {
  assertSameOriginOr403,
  readJson,
  jsonOk,
  zodError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api";

export const runtime = "nodejs";

function canModerate(role: string): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

/** Approve or reject a pending suggestion (moderators & admins only). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!canModerate(session.user.role)) return forbidden();

  const { id } = await params;
  const parsed = suggestionModerateSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);

  const existing = await prisma.translationSuggestion.findUnique({ where: { id } });
  if (!existing) return notFound("Suggestion not found.");

  await prisma.translationSuggestion.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return jsonOk({ ok: true });
}
