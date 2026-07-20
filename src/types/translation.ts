/**
 * Core domain types for the translation engine.
 *
 * Language codes follow ISO 639-3 where a code exists:
 *   - en  : English
 *   - fr  : French
 *   - mfe : Mauritian Creole (Kreol Morisien / Morisyen)
 */

export const LANGUAGES = ["en", "fr", "mfe"] as const;
export type Language = (typeof LANGUAGES)[number];

/** "auto" is only valid as a *source* selection (triggers detection). */
export type SourceSelection = Language | "auto";

export interface LanguageMeta {
  code: Language;
  /** Display label in English. */
  label: string;
  /** Endonym — what speakers call the language themselves. */
  nativeLabel: string;
  flag: string;
}

export const LANGUAGE_META: Record<Language, LanguageMeta> = {
  en: { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  fr: { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  mfe: {
    code: "mfe",
    label: "Mauritian Creole",
    nativeLabel: "Kreol Morisien",
    flag: "🇲🇺",
  },
};

/**
 * Learning difficulty tiers for the Learn section. Vocabulary is grouped by
 * these so learners can progress from first words to everyday slang.
 */
export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export interface LevelMeta {
  value: Level;
  label: string;
  hint: string;
}

export const LEVEL_META: Record<Level, LevelMeta> = {
  beginner: { value: "beginner", label: "Beginner", hint: "First words & greetings" },
  intermediate: { value: "intermediate", label: "Intermediate", hint: "Everyday conversation" },
  advanced: { value: "advanced", label: "Advanced", hint: "Expressions & local slang" },
};

/**
 * The register / situation the translation targets. Drives tone and
 * vocabulary choices (e.g. "slang" vs "formal").
 */
export const REGISTERS = [
  "casual",
  "business",
  "school",
  "tourism",
  "social",
  "formal",
  "slang",
] as const;
export type Register = (typeof REGISTERS)[number];

export interface RegisterMeta {
  value: Register;
  label: string;
  hint: string;
}

export const REGISTER_META: Record<Register, RegisterMeta> = {
  casual: { value: "casual", label: "Casual conversation", hint: "Everyday, relaxed speech" },
  business: { value: "business", label: "Business", hint: "Professional, polite" },
  school: { value: "school", label: "School", hint: "Clear and instructional" },
  tourism: { value: "tourism", label: "Tourism", hint: "Friendly, for visitors" },
  social: { value: "social", label: "Social media", hint: "Short, punchy, current" },
  formal: { value: "formal", label: "Formal letter", hint: "Respectful, structured" },
  slang: { value: "slang", label: "Local slang", hint: "How friends really talk" },
};

/** Which engine produced the final text. */
export type TranslationEngine = "ai" | "dictionary";

export interface TranslationRequest {
  text: string;
  source: SourceSelection;
  target: Language;
  register?: Register;
}

export interface DetectionResult {
  language: Language;
  confidence: number; // 0..1
  signals: string[]; // human-readable reasons, useful for the "Island detection" feature
}

/** A single stage's contribution to the pipeline, kept for transparency/debugging. */
export interface PipelineStageTrace {
  stage: string;
  detail: string;
}

export interface TranslationResult {
  sourceText: string;
  resultText: string;
  source: Language; // resolved (never "auto")
  target: Language;
  register: Register;
  engine: TranslationEngine;
  detection: DetectionResult;
  /** Optional cultural note explaining nuance behind the translation. */
  culturalNote?: string;
  /** Per-stage trace of what the pipeline did. */
  trace: PipelineStageTrace[];
}
