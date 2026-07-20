import { DICTIONARY_ENTRIES, PHRASE_BOOK, WORD_BOOK } from "@/services/translation";
import { LANGUAGES, LEVELS } from "@/types/translation";

const CATEGORIES = [
  "food",
  "family",
  "greetings",
  "expressions",
  "slang",
  "traditional",
  "general",
];

// The Learn quiz needs at least 3 options (correct answer + 2 distractors).
const MIN_ENTRIES_PER_LEVEL = 3;

describe("dictionary data manifests", () => {
  it("gives every dictionary entry a valid language, category and level", () => {
    for (const entry of DICTIONARY_ENTRIES) {
      expect(LANGUAGES).toContain(entry.language);
      expect(CATEGORIES).toContain(entry.category);
      expect(LEVELS).toContain(entry.level);
      expect(entry.headword.length).toBeGreaterThan(0);
      expect(entry.meaningEn.length).toBeGreaterThan(0);
    }
  });

  it("has enough entries at every level to run the quiz", () => {
    for (const level of LEVELS) {
      const count = DICTIONARY_ENTRIES.filter((e) => e.level === level).length;
      expect(count).toBeGreaterThanOrEqual(MIN_ENTRIES_PER_LEVEL);
    }
  });

  it("keeps every phrase and word entry translatable in at least two languages", () => {
    for (const entry of [...PHRASE_BOOK, ...WORD_BOOK]) {
      const filled = LANGUAGES.filter((lang) => entry[lang]);
      expect(filled.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("still contains the canonical seed phrase", () => {
    const tired = PHRASE_BOOK.find((e) => e.en === "i'm very tired today");
    expect(tired?.mfe).toBe("mo bien fatige zordi");
  });
});
