-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'FR', 'MFE', 'RCF');

-- CreateEnum
CREATE TYPE "Register" AS ENUM ('CASUAL', 'BUSINESS', 'SCHOOL', 'TOURISM', 'SOCIAL', 'FORMAL', 'SLANG');

-- CreateEnum
CREATE TYPE "Engine" AS ENUM ('AI', 'DICTIONARY');

-- CreateEnum
CREATE TYPE "DictionaryCategory" AS ENUM ('FOOD', 'FAMILY', 'GREETINGS', 'EXPRESSIONS', 'SLANG', 'TRADITIONAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sourceText" TEXT NOT NULL,
    "resultText" TEXT NOT NULL,
    "sourceLang" "Language" NOT NULL,
    "targetLang" "Language" NOT NULL,
    "register" "Register" NOT NULL DEFAULT 'CASUAL',
    "engine" "Engine" NOT NULL DEFAULT 'DICTIONARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "translationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "translationId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" TEXT NOT NULL,
    "headword" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "partOfSpeech" TEXT,
    "meaningEn" TEXT NOT NULL,
    "meaningFr" TEXT,
    "category" "DictionaryCategory" NOT NULL DEFAULT 'GENERAL',
    "pronunciation" TEXT,
    "examples" TEXT[],
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyWord" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "entryId" TEXT NOT NULL,

    CONSTRAINT "DailyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationSuggestion" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "sourceLang" "Language" NOT NULL,
    "targetLang" "Language" NOT NULL,
    "suggestedText" TEXT NOT NULL,
    "note" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Translation_userId_idx" ON "Translation"("userId");

-- CreateIndex
CREATE INDEX "Translation_sourceLang_targetLang_idx" ON "Translation"("sourceLang", "targetLang");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_translationId_key" ON "Favorite"("userId", "translationId");

-- CreateIndex
CREATE INDEX "DictionaryEntry_category_idx" ON "DictionaryEntry"("category");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_headword_language_key" ON "DictionaryEntry"("headword", "language");

-- CreateIndex
CREATE UNIQUE INDEX "DailyWord_date_key" ON "DailyWord"("date");

-- CreateIndex
CREATE INDEX "TranslationSuggestion_status_idx" ON "TranslationSuggestion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_suggestionId_key" ON "Vote"("userId", "suggestionId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyWord" ADD CONSTRAINT "DailyWord_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationSuggestion" ADD CONSTRAINT "TranslationSuggestion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "TranslationSuggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
