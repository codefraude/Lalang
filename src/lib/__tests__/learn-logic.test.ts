import {
  demote,
  emptyCard,
  INTERVALS,
  isDue,
  isLearned,
  isMastered,
  MAX_BOX,
  promote,
  strength,
} from "@/lib/srs";
import {
  buildUnits,
  currentUnitId,
  dueEntries,
  masteryByLevel,
  overallMastery,
  UNIT_SIZE,
  unitStatus,
  type SrsMap,
} from "@/lib/learn-progress";
import { DICTIONARY_ENTRIES } from "@/services/translation";

const DAY = 86_400_000;
const NOW = 1_700_000_000_000;

describe("srs (Leitner)", () => {
  it("promotes through the boxes and caps at MAX_BOX", () => {
    let rec = emptyCard(NOW);
    for (let i = 0; i < 10; i++) rec = promote(rec, NOW);
    expect(rec.box).toBe(MAX_BOX);
    expect(rec.correct).toBe(10);
    expect(isMastered(rec)).toBe(true);
  });

  it("promote pushes the due date out by the box interval", () => {
    const rec = promote(emptyCard(NOW), NOW);
    expect(rec.box).toBe(1);
    expect(rec.dueAt).toBe(NOW + INTERVALS[1] * DAY);
    expect(isLearned(rec)).toBe(true);
  });

  it("demote drops back to box 0 and counts a miss", () => {
    let rec = promote(promote(emptyCard(NOW), NOW), NOW);
    rec = demote(rec, NOW);
    expect(rec.box).toBe(0);
    expect(rec.misses).toBe(1);
    expect(isDue(rec, NOW)).toBe(true);
  });

  it("treats unseen cards as due and zero-strength", () => {
    expect(isDue(undefined, NOW)).toBe(true);
    expect(strength(undefined, NOW)).toBe(0);
    expect(isLearned(undefined)).toBe(false);
  });

  it("strength decays as a card becomes overdue", () => {
    const rec = promote(promote(promote(emptyCard(NOW), NOW), NOW), NOW); // box 3
    expect(strength(rec, NOW)).toBe(3);
    expect(strength(rec, rec.dueAt + 6 * DAY)).toBeLessThan(3);
  });
});

describe("learn-progress units", () => {
  const units = buildUnits(DICTIONARY_ENTRIES);

  it("covers every entry exactly once across units", () => {
    const total = units.reduce((n, u) => n + u.entries.length, 0);
    expect(total).toBe(DICTIONARY_ENTRIES.length);
    expect(units.length).toBeLessThanOrEqual(Math.ceil(DICTIONARY_ENTRIES.length / UNIT_SIZE));
  });

  it("keeps every unit large enough to be playable (no tiny tail)", () => {
    for (const u of units) expect(u.entries.length).toBeGreaterThanOrEqual(3);
  });

  it("orders units beginner → intermediate → advanced", () => {
    const rank = { beginner: 0, intermediate: 1, advanced: 2 } as const;
    const seq = units.map((u) => rank[u.level]);
    expect([...seq]).toEqual([...seq].sort((a, b) => a - b));
  });

  it("derives lock states relative to the current unit", () => {
    const completed = [0, 1];
    const current = currentUnitId(units, completed);
    expect(current).toBe(2);
    expect(unitStatus(0, completed, current)).toBe("complete");
    expect(unitStatus(2, completed, current)).toBe("current");
    expect(unitStatus(5, completed, current)).toBe("locked");
  });
});

describe("learn-progress mastery", () => {
  it("counts learned/mastered from the SRS map", () => {
    const [a, b] = DICTIONARY_ENTRIES;
    const srs: SrsMap = {
      [a.headword]: promote(emptyCard(NOW), NOW), // learned, not mastered
      [b.headword]: (() => {
        let r = emptyCard(NOW);
        for (let i = 0; i < MAX_BOX; i++) r = promote(r, NOW);
        return r;
      })(), // mastered
    };
    const all = overallMastery(DICTIONARY_ENTRIES, srs);
    expect(all.total).toBe(DICTIONARY_ENTRIES.length);
    expect(all.learned).toBe(2);
    expect(all.mastered).toBe(1);
    const byLevel = masteryByLevel(DICTIONARY_ENTRIES, srs);
    const summed = Object.values(byLevel).reduce((n, m) => n + m.total, 0);
    expect(summed).toBe(DICTIONARY_ENTRIES.length);
  });

  it("only surfaces seen-and-due cards for review", () => {
    const seen = DICTIONARY_ENTRIES[0].headword;
    const srs: SrsMap = { [seen]: { box: 1, dueAt: NOW - DAY, seen: 1, correct: 1, misses: 0 } };
    const due = dueEntries(DICTIONARY_ENTRIES, srs, NOW);
    expect(due).toHaveLength(1);
    expect(due[0].headword).toBe(seen);
  });
});
