import { z } from "zod";
import { LANGUAGES, REGISTERS } from "@/types/translation";

export const MAX_INPUT_LENGTH = 1000;
/** Text-to-speech also reads translation *output*, which can run a bit longer. */
export const MAX_TTS_LENGTH = 2500;

export const translateSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Enter some text to translate.")
    .max(MAX_INPUT_LENGTH, `Keep it under ${MAX_INPUT_LENGTH} characters.`),
  source: z.enum([...LANGUAGES, "auto"] as [string, ...string[]]),
  target: z.enum(LANGUAGES as unknown as [string, ...string[]]),
  register: z.enum(REGISTERS as unknown as [string, ...string[]]).optional(),
});

export type TranslateInput = z.infer<typeof translateSchema>;

export const ttsSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Nothing to read.")
    .max(MAX_TTS_LENGTH, `Keep it under ${MAX_TTS_LENGTH} characters.`),
  lang: z.enum(LANGUAGES as unknown as [string, ...string[]]),
});

export type TtsInput = z.infer<typeof ttsSchema>;

export const dictionarySearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(40).optional(),
  language: z.enum(LANGUAGES as unknown as [string, ...string[]]).optional(),
});

/** A community-submitted improvement to a translation. */
export const suggestionSchema = z.object({
  sourceText: z.string().trim().min(1, "Missing the original text.").max(MAX_INPUT_LENGTH),
  suggestedText: z
    .string()
    .trim()
    .min(1, "Enter your suggested translation.")
    .max(MAX_INPUT_LENGTH, `Keep it under ${MAX_INPUT_LENGTH} characters.`),
  sourceLang: z.enum(LANGUAGES as unknown as [string, ...string[]]),
  targetLang: z.enum(LANGUAGES as unknown as [string, ...string[]]),
  note: z.string().trim().max(300, "Keep the note under 300 characters.").optional(),
});

export type SuggestionInput = z.infer<typeof suggestionSchema>;

/** Moderator decision on a pending suggestion. */
export const suggestionModerateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
