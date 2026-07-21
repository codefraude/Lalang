/**
 * Leitner spaced-repetition scheduler — pure, deterministic, no `window` access.
 *
 * Each word lives in a "box" (0..MAX_BOX). Higher box = stronger memory = longer
 * wait before it's due for review again. `now` is always passed in as an argument
 * so every function here is trivially unit-testable and SSR-safe.
 */

export const MAX_BOX = 4;

/** Days a card in each box waits before becoming due again (box 0 = immediately). */
export const INTERVALS = [0, 1, 3, 7, 16] as const;

const DAY = 86_400_000;

export interface CardRecord {
  box: number; // 0..MAX_BOX
  dueAt: number; // epoch ms — when this card should next be reviewed
  seen: number; // times answered
  correct: number;
  misses: number;
}

export function emptyCard(now: number): CardRecord {
  return { box: 0, dueAt: now, seen: 0, correct: 0, misses: 0 };
}

/** Correct recall → advance one box and push the due date further out. */
export function promote(rec: CardRecord | undefined, now: number): CardRecord {
  const base = rec ?? emptyCard(now);
  const box = Math.min(MAX_BOX, base.box + 1);
  return {
    box,
    dueAt: now + INTERVALS[box] * DAY,
    seen: base.seen + 1,
    correct: base.correct + 1,
    misses: base.misses,
  };
}

/** Missed recall → drop back to box 0 so it resurfaces almost immediately. */
export function demote(rec: CardRecord | undefined, now: number): CardRecord {
  const base = rec ?? emptyCard(now);
  return {
    box: 0,
    dueAt: now + INTERVALS[0] * DAY,
    seen: base.seen + 1,
    correct: base.correct,
    misses: base.misses + 1,
  };
}

/** Unseen cards are always "due". */
export function isDue(rec: CardRecord | undefined, now: number): boolean {
  return !rec || rec.dueAt <= now;
}

/**
 * Effective strength 0..MAX_BOX for display. An overdue card loses apparent
 * strength (memory decays), so reference "strength bars" visibly fade with time.
 */
export function strength(rec: CardRecord | undefined, now: number): number {
  if (!rec) return 0;
  if (rec.dueAt <= now) {
    const overdueDays = (now - rec.dueAt) / DAY;
    return Math.max(0, rec.box - Math.floor(overdueDays / 2));
  }
  return rec.box;
}

/** Started learning: recalled correctly at least once. Drives the hero ring. */
export function isLearned(rec: CardRecord | undefined): boolean {
  return !!rec && rec.box >= 1;
}

/** Fully mastered: reached the top box. */
export function isMastered(rec: CardRecord | undefined): boolean {
  return !!rec && rec.box >= MAX_BOX;
}
