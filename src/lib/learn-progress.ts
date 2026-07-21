/**
 * Pure domain logic for the Learn journey: chunk the ordered dictionary into
 * fixed-size "units", derive each unit's lock state, and aggregate mastery.
 * No React, no `window` — everything is a pure function of (entries, srs, now).
 */

import type { DictionaryCategory, SeedDictionaryEntry } from "@/services/translation";
import { LEVELS, type Level } from "@/types/translation";
import { isDue, isLearned, isMastered, type CardRecord } from "@/lib/srs";

export const UNIT_SIZE = 5;

const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

export type SrsMap = Record<string, CardRecord>;

export interface Unit {
  id: number;
  level: Level;
  category: DictionaryCategory; // dominant category of the chunk
  entries: SeedDictionaryEntry[];
}

/** Stable ordering (level rank, then source order) so units never reshuffle. */
function ordered(entries: SeedDictionaryEntry[]): SeedDictionaryEntry[] {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => LEVEL_RANK[a.e.level] - LEVEL_RANK[b.e.level] || a.i - b.i)
    .map((x) => x.e);
}

function dominantCategory(entries: SeedDictionaryEntry[]): DictionaryCategory {
  const counts = new Map<DictionaryCategory, number>();
  for (const e of entries) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  let best = entries[0].category;
  let max = 0;
  for (const [cat, n] of counts) {
    if (n > max) {
      max = n;
      best = cat;
    }
  }
  return best;
}

/** Chunk all entries into ordered ~5-word units covering every word exactly once. */
export function buildUnits(entries: SeedDictionaryEntry[]): Unit[] {
  const sorted = ordered(entries);
  const units: Unit[] = [];
  for (let i = 0; i < sorted.length; i += UNIT_SIZE) {
    const chunk = sorted.slice(i, i + UNIT_SIZE);
    units.push({ id: units.length, level: chunk[0].level, category: dominantCategory(chunk), entries: chunk });
  }
  // Fold a too-small trailing chunk into the previous unit so every unit is
  // playable (enough words for distractors and a match exercise).
  if (units.length >= 2 && units[units.length - 1].entries.length < 3) {
    const tail = units.pop()!;
    const prev = units[units.length - 1];
    prev.entries = [...prev.entries, ...tail.entries];
    prev.category = dominantCategory(prev.entries);
  }
  return units;
}

export type UnitStatus = "locked" | "current" | "complete";

/** The next unit to play: the lowest-id unit not yet completed. */
export function currentUnitId(units: Unit[], completed: number[]): number {
  const next = units.find((u) => !completed.includes(u.id));
  return next ? next.id : Math.max(0, units.length - 1);
}

export function unitStatus(unitId: number, completed: number[], currentId: number): UnitStatus {
  if (completed.includes(unitId)) return "complete";
  if (unitId === currentId) return "current";
  return "locked";
}

export interface Mastery {
  learned: number;
  mastered: number;
  total: number;
}

function tally(entries: SeedDictionaryEntry[], srs: SrsMap): Mastery {
  let learned = 0;
  let mastered = 0;
  for (const e of entries) {
    const rec = srs[e.headword];
    if (isLearned(rec)) learned++;
    if (isMastered(rec)) mastered++;
  }
  return { learned, mastered, total: entries.length };
}

export function overallMastery(entries: SeedDictionaryEntry[], srs: SrsMap): Mastery {
  return tally(entries, srs);
}

export function masteryByLevel(entries: SeedDictionaryEntry[], srs: SrsMap): Record<Level, Mastery> {
  const out = {} as Record<Level, Mastery>;
  for (const lv of LEVELS) out[lv] = tally(entries.filter((e) => e.level === lv), srs);
  return out;
}

export function masteryByCategory(
  entries: SeedDictionaryEntry[],
  srs: SrsMap,
): Array<{ category: DictionaryCategory; mastery: Mastery }> {
  const cats = [...new Set(ordered(entries).map((e) => e.category))];
  return cats.map((category) => ({ category, mastery: tally(entries.filter((e) => e.category === category), srs) }));
}

/** Words the learner has already met and are due for review (drives the deck). */
export function dueEntries(entries: SeedDictionaryEntry[], srs: SrsMap, now: number): SeedDictionaryEntry[] {
  return ordered(entries).filter((e) => {
    const rec = srs[e.headword];
    return rec && isDue(rec, now);
  });
}
