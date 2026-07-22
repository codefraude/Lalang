"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlipCard } from "@/components/learn/flip-card";
import { SpeakButton } from "@/components/speak-button";
import { LANGUAGE_META } from "@/types/translation";
import type { SeedDictionaryEntry } from "@/services/translation";

const FACE = "flex h-full w-full flex-col items-center justify-center gap-2 rounded-[var(--radius)] border bg-card p-6 text-center shadow-md";

/** Spaced-repetition review: flip a due card, then rate recall (tap, keys 1/2,
 *  or drag). Empty/complete states point the learner back to the journey. */
export function FlashcardDeck({
  dueEntries,
  onRate,
  mastered,
  total,
  onStart,
}: {
  dueEntries: SeedDictionaryEntry[];
  onRate: (headword: string, got: boolean) => void;
  mastered: number;
  total: number;
  onStart?: () => void;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const gotOpacity = useTransform(x, [40, 140], [0, 1]);
  const missOpacity = useTransform(x, [-140, -40], [1, 0]);
  const entry = dueEntries[i];

  const rate = React.useCallback(
    (got: boolean) => {
      const e = dueEntries[i];
      if (!e) return;
      onRate(e.headword, got);
      setFlipped(false);
      x.set(0);
      setI((n) => n + 1);
    },
    [dueEntries, i, onRate, x],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1") rate(false);
      else if (e.key === "2") rate(true);
      else if (e.key === " " && entry) {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rate, entry]);

  if (!entry) {
    const caughtUp = dueEntries.length === 0;
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="size-6" />
        </span>
        <p className="font-semibold">{caughtUp ? "All caught up" : "Review complete!"}</p>
        <p className="text-sm text-muted-foreground">
          {caughtUp ? "Nothing is due for review — learn a new unit to grow your deck." : `You reviewed ${i} card${i === 1 ? "" : "s"}.`}
          <br />
          {mastered} of {total} words mastered.
        </p>
        {onStart && <Button onClick={onStart}>Go to journey</Button>}
      </Card>
    );
  }

  const meta = LANGUAGE_META[entry.language];

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-sm text-muted-foreground">
        {dueEntries.length - i} due · tap to flip
      </p>
      <motion.div
        className="relative w-full max-w-sm"
        style={reduce ? undefined : { x, rotate }}
        drag={reduce ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={(_, info) => {
          if (info.offset.x > 120) rate(true);
          else if (info.offset.x < -120) rate(false);
        }}
      >
        {!reduce && (
          <>
            <motion.span style={{ opacity: gotOpacity }} className="absolute right-3 top-3 z-10 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
              Got it
            </motion.span>
            <motion.span style={{ opacity: missOpacity }} className="absolute left-3 top-3 z-10 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
              Missed
            </motion.span>
          </>
        )}
        <FlipCard
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          ariaLabel={`Flashcard: ${entry.headword}`}
          className="h-56"
          front={
            <div className={FACE}>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{meta.flag} {meta.nativeLabel}</span>
              <p className="gradient-text font-display text-4xl font-bold">{entry.headword}</p>
              {entry.pronunciation && <p className="text-sm text-muted-foreground">/{entry.pronunciation}/</p>}
              <SpeakButton text={entry.headword} lang={entry.language} className="mt-1 border" />
            </div>
          }
          back={
            <div className={`${FACE} bg-primary/5`}>
              <p className="text-2xl font-semibold">{entry.meaningEn}</p>
              {entry.meaningFr && <p className="text-muted-foreground">{entry.meaningFr}</p>}
              {entry.examples?.[0] && <p className="text-sm italic text-muted-foreground">{entry.examples[0]}</p>}
            </div>
          }
        />
      </motion.div>
      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={() => rate(false)} className="gap-1">
          <X className="size-4 text-destructive" /> Missed
        </Button>
        <Button onClick={() => rate(true)} className="gap-1">
          <Check className="size-4" /> Got it
        </Button>
      </div>
    </div>
  );
}
