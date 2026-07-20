import { z } from "zod";
import { LANGUAGES, REGISTERS } from "@/types/translation";

export const MAX_INPUT_LENGTH = 1000;

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

export const dictionarySearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(40).optional(),
  language: z.enum(LANGUAGES as unknown as [string, ...string[]]).optional(),
});
