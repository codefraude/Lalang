"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/components/learn/round-builder";

type MatchEx = Extract<Exercise, { kind: "match" }>;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tap a Kreol word then its meaning to snap them together — the tactile star. */
export function MatchExercise({ exercise, onDone }: { exercise: MatchEx; onDone: (correct: boolean) => void }) {
  const { pairs } = exercise;
  const meaningOf = React.useMemo(() => Object.fromEntries(pairs.map((p) => [p.headword, p.meaning])), [pairs]);
  const [left] = React.useState(() => shuffle(pairs.map((p) => p.headword)));
  const [right] = React.useState(() => shuffle(pairs.map((p) => p.meaning)));

  const [selL, setSelL] = React.useState<string | null>(null);
  const [selR, setSelR] = React.useState<string | null>(null);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [wrong, setWrong] = React.useState<string | null>(null);
  const mistakes = React.useRef(0);

  const matchedMeanings = React.useMemo(
    () => new Set([...matched].map((h) => meaningOf[h])),
    [matched, meaningOf],
  );

  const resolve = (headword: string, meaning: string) => {
    if (meaningOf[headword] === meaning) {
      setMatched((prev) => {
        const next = new Set(prev).add(headword);
        if (next.size === pairs.length) window.setTimeout(() => onDone(mistakes.current === 0), 500);
        return next;
      });
    } else {
      mistakes.current += 1;
      setWrong(headword);
      window.setTimeout(() => setWrong(null), 450);
    }
    setSelL(null);
    setSelR(null);
  };

  const pickLeft = (h: string) => {
    if (matched.has(h)) return;
    if (selR) resolve(h, selR);
    else setSelL(h);
  };
  const pickRight = (m: string) => {
    if (matchedMeanings.has(m)) return;
    if (selL) resolve(selL, m);
    else setSelR(m);
  };

  const chip = (label: string, selected: boolean, done: boolean, shake: boolean) =>
    cn(
      "rounded-[var(--radius)] border px-3 py-3 text-center text-sm font-medium transition-colors",
      done && "border-success/50 bg-success/10 text-success opacity-60",
      !done && selected && "border-primary bg-primary/10 text-primary",
      !done && !selected && "hover:border-primary/50",
      shake && "border-destructive/60",
    );

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Match the pairs</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {left.map((h) => (
            <motion.button
              key={h}
              type="button"
              onClick={() => pickLeft(h)}
              disabled={matched.has(h)}
              whileTap={{ scale: 0.97 }}
              animate={wrong === h ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
              className={cn("block w-full", chip(h, selL === h, matched.has(h), wrong === h))}
            >
              {h}
            </motion.button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((m) => (
            <motion.button
              key={m}
              type="button"
              onClick={() => pickRight(m)}
              disabled={matchedMeanings.has(m)}
              whileTap={{ scale: 0.97 }}
              className={cn("block w-full", chip(m, selR === m, matchedMeanings.has(m), false))}
            >
              {m}
            </motion.button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {matched.size} / {pairs.length} matched
      </p>
    </div>
  );
}
