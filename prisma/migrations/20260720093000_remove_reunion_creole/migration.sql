-- Remove the Réunion Creole (RCF) value from the Language enum.
-- All rows referencing RCF were deleted beforehand, so the USING casts succeed.
BEGIN;
CREATE TYPE "Language_new" AS ENUM ('EN', 'FR', 'MFE');
ALTER TABLE "Translation" ALTER COLUMN "sourceLang" TYPE "Language_new" USING ("sourceLang"::text::"Language_new");
ALTER TABLE "Translation" ALTER COLUMN "targetLang" TYPE "Language_new" USING ("targetLang"::text::"Language_new");
ALTER TABLE "TranslationSuggestion" ALTER COLUMN "sourceLang" TYPE "Language_new" USING ("sourceLang"::text::"Language_new");
ALTER TABLE "TranslationSuggestion" ALTER COLUMN "targetLang" TYPE "Language_new" USING ("targetLang"::text::"Language_new");
ALTER TABLE "DictionaryEntry" ALTER COLUMN "language" TYPE "Language_new" USING ("language"::text::"Language_new");
ALTER TYPE "Language" RENAME TO "Language_old";
ALTER TYPE "Language_new" RENAME TO "Language";
DROP TYPE "Language_old";
COMMIT;
