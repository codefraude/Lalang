"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/learn/count-up";
import { categoryStyle } from "@/components/learn/category-kit";
import { buildRound, type Exercise } from "@/components/learn/round-builder";
import { ChoiceExercise } from "@/components/learn/exercises/choice-exercise";
import { ClozeExercise } from "@/components/learn/exercises/cloze-exercise";
import { MatchExercise } from "@/components/learn/exercises/match-exercise";
import { EASE_PREMIUM } from "@/components/learn/motion";
import type { SeedDictionaryEntry } from "@/services/translation";
import type { Unit } from "@/lib/learn-progress";

interface Props {
  unit: Unit;
  allEntries: SeedDictionaryEntry[];
  onAnswer: (headword: string, correct: boolean) => void;
  onComplete: (scorePct: number) => void;
  onClose: () => void;
}

function verdict(pct: number): string {
  if (pct >= 1) return "Perfect — mari bon! 🌴";
  if (pct >= 0.7) return "Great work — to pe aprann vit!";
  if (pct >= 0.4) return "Good effort — try another round.";
  return "Keep practising, ou pou gagne!";
}

function renderExercise(ex: Exercise, onDone: (c: boolean) => void) {
  if (ex.kind === "choice") return <ChoiceExercise exercise={ex} onDone={onDone} />;
  if (ex.kind === "cloze") return <ClozeExercise exercise={ex} onDone={onDone} />;
  return <MatchExercise exercise={ex} onDone={onDone} />;
}

export function PracticeSession({ unit, allEntries, onAnswer, onComplete, onClose }: Props) {
  const [round] = React.useState(() => buildRound(unit.entries, allEntries));
  const [index, setIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const total = round.length;
  const cat = categoryStyle(unit.category);
  const Icon = cat.icon;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDone = (correct: boolean) => {
    const ex = round[index];
    if (ex.kind === "match") ex.pairs.forEach((p) => onAnswer(p.headword, correct));
    else onAnswer(ex.entry.headword, correct);
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    setStreak((s) => (correct ? s + 1 : 0));
    if (index + 1 >= total) {
      setFinished(true);
      onComplete(Math.round((nextScore / total) * 100) / 100);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const answered = finished ? total : index;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Practice: ${cat.label}`}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ ease: EASE_PREMIUM, duration: 0.28 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            Unit {unit.id + 1} · {cat.label}
          </span>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {streak > 1 && (
              <span className="inline-flex items-center gap-1 font-medium text-accent">
                <Flame className="size-4" /> {streak}
              </span>
            )}
            <span>
              {Math.min(answered + (finished ? 0 : 1), total)}/{total}
            </span>
            <button type="button" onClick={onClose} aria-label="Close practice" className="rounded-full p-1 hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="h-1 w-full bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${Math.round((answered / total) * 100)}%` }}
            transition={{ ease: EASE_PREMIUM, duration: 0.4 }}
          />
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-6 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="size-7" />
                </span>
                <p className="mt-4 text-2xl font-bold">
                  <CountUp to={score} /> / {total}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{verdict(score / total)}</p>
                <div className="mt-5 flex gap-2">
                  <Button onClick={onClose}>Back to journey</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={index} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                {renderExercise(round[index], handleDone)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
