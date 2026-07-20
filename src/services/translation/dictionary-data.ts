import type { Language, Register, Level } from "@/types/translation";
import phrasebookJson from "@/data/phrasebook.json";
import wordbookJson from "@/data/wordbook.json";
import dictionaryJson from "@/data/dictionary.json";

/**
 * SEED DATA — the linguistic core of the offline engine.
 *
 * The actual vocabulary lives in JSON manifests under `src/data/` so it can
 * grow (and be reviewed / community-sourced) without bloating this module. This
 * file just types the manifests and re-exports them.
 *
 * Source of truth for orthography:
 *   - Kreol Morisien: Akademi Kreol Morisien standard (grafi-larmoni).
 * This is a living language with spelling variation; treat entries as
 * "a correct form", not "the only form". Native-speaker review is welcome.
 */

export interface PhraseEntry {
  en?: string;
  fr?: string;
  mfe?: string; // Mauritian Creole
  register?: Register;
  level?: Level;
  note?: string;
}

export type DictionaryCategory =
  | "food"
  | "family"
  | "greetings"
  | "expressions"
  | "slang"
  | "traditional"
  | "general";

export interface SeedDictionaryEntry {
  headword: string;
  language: Language;
  partOfSpeech?: string;
  meaningEn: string;
  meaningFr?: string;
  category: DictionaryCategory;
  level: Level;
  pronunciation?: string;
  examples?: string[];
}

/** Full-sentence / multi-word phrases. Matched before individual words. */
export const PHRASE_BOOK = phrasebookJson as unknown as PhraseEntry[];

/** Single-word fallbacks. Matched after phrases. */
export const WORD_BOOK = wordbookJson as unknown as PhraseEntry[];

/** Richer entries for the Cultural Dictionary and Learn pages. */
export const DICTIONARY_ENTRIES = dictionaryJson as unknown as SeedDictionaryEntry[];
