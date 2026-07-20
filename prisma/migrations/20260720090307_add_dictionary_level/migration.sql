-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "DictionaryEntry" ADD COLUMN     "level" "Level" NOT NULL DEFAULT 'BEGINNER';

-- CreateIndex
CREATE INDEX "DictionaryEntry_level_idx" ON "DictionaryEntry"("level");
