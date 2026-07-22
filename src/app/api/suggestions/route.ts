import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { suggestionSchema } from "@/utils/validation";
import {
  assertSameOriginOr403,
  rateOr429,
  readJson,
  jsonOk,
  zodError,
  unauthorized,
  forbidden,
} from "@/lib/api";
import type { Language } from "@/types/translation";

export const runtime = "nodejs";

const langToEnum = { en: "EN", fr: "FR", mfe: "MFE" } as const;

function canModerate(role: string): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

/** Submit an improved translation for community/moderator review. */
export async function POST(req: Request) {
  const csrf = assertSameOriginOr403(req);
  if (csrf) return csrf;

  const session = await auth();
  if (!session?.user) return unauthorized();

  const limited = await rateOr429(req, `suggest:${session.user.id}`, 10, 60_000);
  if (limited) return limited;

  const parsed = suggestionSchema.safeParse(await readJson(req));
  if (!parsed.success) return zodError(parsed.error);
  const { sourceText, suggestedText, sourceLang, targetLang, note } = parsed.data;

  await prisma.translationSuggestion.create({
    data: {
      createdById: session.user.id,
      sourceText,
      suggestedText,
      sourceLang: langToEnum[sourceLang as Language],
      targetLang: langToEnum[targetLang as Language],
      note: note ?? null,
    },
  });

  return jsonOk({ ok: true });
}

/** List pending suggestions for moderation (moderators & admins only). */
export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!canModerate(session.user.role)) return forbidden();

  const suggestions = await prisma.translationSuggestion.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { createdBy: { select: { name: true, email: true } } },
  });

  return jsonOk({ suggestions });
}
