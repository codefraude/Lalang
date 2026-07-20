import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DICTIONARY_ENTRIES } from "@/services/translation";
import { dictionarySearchSchema } from "@/utils/validation";
import type { Language, Level } from "@/types/translation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = dictionarySearchSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    language: searchParams.get("language") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search." }, { status: 400 });
  }

  const { q, category, language } = parsed.data;

  // Try the database first.
  try {
    const entries = await prisma.dictionaryEntry.findMany({
      where: {
        approved: true,
        ...(language ? { language: language.toUpperCase() as "EN" | "FR" | "MFE" } : {}),
        ...(category ? { category: category.toUpperCase() as never } : {}),
        ...(q
          ? {
              OR: [
                { headword: { contains: q, mode: "insensitive" } },
                { meaningEn: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      take: 200,
      orderBy: { headword: "asc" },
    });
    if (entries.length > 0) {
      // DB enums are uppercase (EN, MFE, GENERAL…); the client keys LANGUAGE_META
      // by lowercase codes, so normalise to match the seed-data shape.
      const normalized = entries.map((e) => ({
        ...e,
        language: e.language.toLowerCase() as Language,
        category: e.category.toLowerCase(),
        level: e.level.toLowerCase() as Level,
      }));
      return NextResponse.json({ source: "db", entries: normalized });
    }
  } catch {
    // fall through to seed data
  }

  // Fallback: filter the in-memory seed data (works with no DB).
  const filtered = DICTIONARY_ENTRIES.filter((e) => {
    if (language && e.language !== language) return false;
    if (category && e.category !== category) return false;
    if (q) {
      const needle = q.toLowerCase();
      return (
        e.headword.toLowerCase().includes(needle) ||
        e.meaningEn.toLowerCase().includes(needle)
      );
    }
    return true;
  });

  return NextResponse.json({ source: "seed", entries: filtered });
}
