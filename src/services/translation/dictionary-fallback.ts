import type { Language } from "@/types/translation";
import { PHRASE_BOOK, WORD_BOOK, type PhraseEntry } from "./dictionary-data";

export interface DictionaryMatch {
  text: string;
  matchType: "phrase" | "word-gloss";
  note?: string;
  /** Rough quality signal so the UI can flag low-confidence glosses. */
  coverage: number; // 0..1 — fraction of source words that were translated
}

/** Normalise for lookup: lowercase, strip surrounding punctuation, collapse spaces. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.!?,;:"']+$/g, "")
    .replace(/\s+/g, " ");
}

function lookup(
  book: PhraseEntry[],
  source: Language,
  target: Language,
  needle: string,
): string | undefined {
  const entry = book.find((e) => e[source] && normalize(e[source]!) === needle);
  return entry?.[target];
}

/**
 * Translate using only the local dictionary. Returns `null` when nothing
 * useful can be produced (the caller can then surface a graceful message).
 */
export function translateWithDictionary(
  text: string,
  source: Language,
  target: Language,
): DictionaryMatch | null {
  if (source === target) {
    return { text, matchType: "phrase", coverage: 1 };
  }

  const needle = normalize(text);

  // 1. Whole-phrase match (highest quality).
  const phrase = lookup(PHRASE_BOOK, source, target, needle);
  if (phrase) {
    const entry = PHRASE_BOOK.find(
      (e) => e[source] && normalize(e[source]!) === needle,
    );
    return { text: phrase, matchType: "phrase", note: entry?.note, coverage: 1 };
  }

  // 2. Single-word match.
  const word = lookup(WORD_BOOK, source, target, needle);
  if (word) {
    return { text: word, matchType: "phrase", coverage: 1 };
  }

  // 3. Word-by-word gloss (lower quality, clearly flagged).
  const words = needle.split(" ");
  let translated = 0;
  const glossed = words.map((w) => {
    const hit =
      lookup(WORD_BOOK, source, target, w) ??
      lookup(PHRASE_BOOK, source, target, w);
    if (hit) {
      translated += 1;
      return hit;
    }
    return w; // leave untranslated words as-is
  });

  if (translated === 0) return null;

  return {
    text: glossed.join(" "),
    matchType: "word-gloss",
    coverage: translated / words.length,
    note: "Word-by-word fallback — grammar may be imperfect. Add an OpenAI key for fluent output.",
  };
}
