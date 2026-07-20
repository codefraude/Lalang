import {
  PrismaClient,
  type DictionaryCategory,
  type Language,
  type Level,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { DICTIONARY_ENTRIES } from "../src/services/translation/dictionary-data";

const prisma = new PrismaClient();

const LANG_MAP: Record<string, Language> = {
  en: "EN",
  fr: "FR",
  mfe: "MFE",
};

const CATEGORY_MAP: Record<string, DictionaryCategory> = {
  food: "FOOD",
  family: "FAMILY",
  greetings: "GREETINGS",
  expressions: "EXPRESSIONS",
  slang: "SLANG",
  traditional: "TRADITIONAL",
  general: "GENERAL",
};

const LEVEL_MAP: Record<string, Level> = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
};

async function main() {
  console.log("Seeding dictionary…");
  for (const entry of DICTIONARY_ENTRIES) {
    const fields = {
      partOfSpeech: entry.partOfSpeech ?? null,
      meaningEn: entry.meaningEn,
      meaningFr: entry.meaningFr ?? null,
      category: CATEGORY_MAP[entry.category],
      level: LEVEL_MAP[entry.level],
      pronunciation: entry.pronunciation ?? null,
      examples: entry.examples ?? [],
      approved: true,
    };
    await prisma.dictionaryEntry.upsert({
      where: {
        headword_language: {
          headword: entry.headword,
          language: LANG_MAP[entry.language],
        },
      },
      update: fields,
      create: {
        headword: entry.headword,
        language: LANG_MAP[entry.language],
        ...fields,
      },
    });
  }
  console.log(`  ✓ ${DICTIONARY_ENTRIES.length} entries`);

  console.log("Creating admin user…");
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@lalang.mu";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Lalang Admin",
      role: "ADMIN",
      passwordHash,
    },
  });
  console.log(`  ✓ admin: ${adminEmail}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
