"use client";

import * as React from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { demote, promote, type CardRecord } from "@/lib/srs";
import type { SrsMap } from "@/lib/learn-progress";

const KEY = "lalang.learn.v1";
const VERSION = 1;
const DAY = 86_400_000;

/** Streak milestones that trigger the special island celebration. */
export const MILESTONES = [3, 7, 30] as const;

export interface Streak {
  lastActiveDate: string; // local YYYY-M-D
  count: number;
  todayCount: number;
  goal: number;
}

export interface LearnRecords {
  bestScorePct: number;
  longestStreak: number;
}

export interface LearnState {
  version: number;
  seen: boolean; // first-visit intro completed
  srs: SrsMap;
  completedUnits: number[];
  streak: Streak;
  records: LearnRecords;
}

const INITIAL: LearnState = {
  version: VERSION,
  seen: false,
  srs: {},
  completedUnits: [],
  streak: { lastActiveDate: "", count: 0, todayCount: 0, goal: 5 },
  records: { bestScorePct: 0, longestStreak: 0 },
};

function dateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Advance the streak for a fresh day (or reset it after a missed day). */
function bumpStreak(streak: Streak, now: number): Streak {
  const today = dateKey(now);
  if (streak.lastActiveDate === today) return streak;
  const consecutive = streak.lastActiveDate === dateKey(now - DAY);
  return { ...streak, count: consecutive ? streak.count + 1 : 1, todayCount: 0, lastActiveDate: today };
}

function withActivity(state: LearnState, now: number): LearnState {
  const streak0 = bumpStreak(state.streak, now);
  const streak = { ...streak0, todayCount: streak0.todayCount + 1 };
  const records = { ...state.records, longestStreak: Math.max(state.records.longestStreak, streak.count) };
  return { ...state, streak, records };
}

function setCard(srs: SrsMap, headword: string, rec: CardRecord): SrsMap {
  return { ...srs, [headword]: rec };
}

export function isMilestone(count: number): boolean {
  return (MILESTONES as readonly number[]).includes(count);
}

export function useLearnProgress() {
  const [raw, setRaw, hydrated] = useLocalStorage<LearnState>(KEY, INITIAL);
  const state = raw && raw.version === VERSION ? raw : INITIAL;

  const recordAnswer = React.useCallback(
    (headword: string, correct: boolean) => {
      setRaw((s) => {
        const base = s.version === VERSION ? s : INITIAL;
        const now = Date.now();
        const rec = correct ? promote(base.srs[headword], now) : demote(base.srs[headword], now);
        return { ...withActivity(base, now), srs: setCard(base.srs, headword, rec) };
      });
    },
    [setRaw],
  );

  const rateCard = React.useCallback(
    (headword: string, got: boolean) => recordAnswer(headword, got),
    [recordAnswer],
  );

  /** Marks a unit complete, records the best score, and returns the fresh state
   *  so the caller can decide the celebration tier (incl. streak milestones). */
  const completeUnit = React.useCallback(
    (unitId: number, scorePct: number): LearnState => {
      const now = Date.now();
      const base = state;
      const completedUnits = base.completedUnits.includes(unitId)
        ? base.completedUnits
        : [...base.completedUnits, unitId];
      const active = withActivity(base, now);
      const next: LearnState = {
        ...active,
        completedUnits,
        records: { ...active.records, bestScorePct: Math.max(active.records.bestScorePct, scorePct) },
      };
      setRaw(next);
      return next;
    },
    [state, setRaw],
  );

  const completeIntro = React.useCallback(
    (goal: number) => setRaw((s) => ({ ...(s.version === VERSION ? s : INITIAL), seen: true, streak: { ...s.streak, goal } })),
    [setRaw],
  );

  return { state, hydrated, recordAnswer, rateCard, completeUnit, completeIntro };
}

export type UseLearnProgress = ReturnType<typeof useLearnProgress>;
