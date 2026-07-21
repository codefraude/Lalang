import type { SeedDictionaryEntry } from "@/services/translation";

/**
 * Pure round generator. Given a unit's entries (+ the full corpus for
 * distractors) it emits a shuffled, interleaved list of exercises. Runs only on
 * the client (uses Math.random), so it never touches SSR output.
 */

export type Exercise =
  | { kind: "choice"; direction: "toEn" | "toMfe"; entry: SeedDictionaryEntry; options: string[] }
  | { kind: "cloze"; entry: SeedDictionaryEntry; sentence: string; gloss?: string; options: string[] }
  | { kind: "match"; pairs: Array<{ headword: string; meaning: string }> };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` distractor values close to the answer (same category first). */
function distractors(
  pool: SeedDictionaryEntry[],
  pick: (e: SeedDictionaryEntry) => string,
  answer: string,
  category: string,
  n: number,
): string[] {
  const uniq = (list: string[]) => [...new Set(list)].filter((v) => v !== answer);
  const same = uniq(pool.filter((e) => e.category === category).map(pick));
  const any = uniq(pool.map(pick));
  const source = same.length >= n ? same : [...new Set([...same, ...any])];
  return shuffle(source).slice(0, n);
}

function choiceFor(entry: SeedDictionaryEntry, pool: SeedDictionaryEntry[], i: number): Exercise {
  if (i % 2 === 0) {
    const options = shuffle([entry.meaningEn, ...distractors(pool, (e) => e.meaningEn, entry.meaningEn, entry.category, 2)]);
    return { kind: "choice", direction: "toEn", entry, options };
  }
  const options = shuffle([entry.headword, ...distractors(pool, (e) => e.headword, entry.headword, entry.category, 2)]);
  return { kind: "choice", direction: "toMfe", entry, options };
}

function clozeFor(entry: SeedDictionaryEntry, pool: SeedDictionaryEntry[]): Exercise | null {
  const sentence = entry.examples?.[0];
  if (!sentence) return null;
  const idx = sentence.toLowerCase().indexOf(entry.headword.toLowerCase());
  if (idx < 0) return null;
  const blanked = sentence.slice(0, idx) + "____" + sentence.slice(idx + entry.headword.length);
  const options = shuffle([entry.headword, ...distractors(pool, (e) => e.headword, entry.headword, entry.category, 2)]);
  return { kind: "cloze", entry, sentence: blanked, gloss: entry.examples?.[1], options };
}

export function buildRound(entries: SeedDictionaryEntry[], allEntries: SeedDictionaryEntry[]): Exercise[] {
  const choices = entries.map((e, i) => choiceFor(e, allEntries, i));
  const clozes = entries.map((e) => clozeFor(e, allEntries)).filter((x): x is Exercise => x !== null).slice(0, 1);
  const match: Exercise[] =
    entries.length >= 3
      ? [{ kind: "match", pairs: shuffle(entries).slice(0, Math.min(4, entries.length)).map((e) => ({ headword: e.headword, meaning: e.meaningEn })) }]
      : [];
  return shuffle([...choices, ...clozes, ...match]).slice(0, 7);
}
