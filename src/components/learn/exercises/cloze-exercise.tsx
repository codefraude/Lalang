"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POP, SHAKE } from "@/components/learn/motion";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/components/learn/round-builder";

type ClozeEx = Extract<Exercise, { kind: "cloze" }>;

/** Fill the blank in a real example sentence (the generation effect). */
export function ClozeExercise({ exercise, onDone }: { exercise: ClozeEx; onDone: (correct: boolean) => void }) {
  const { entry, sentence, gloss, options } = exercise;
  const [picked, setPicked] = React.useState<string | null>(null);
  const correct = picked === entry.headword;
  const filled = sentence.replace("____", picked ?? "____");

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fill the blank</p>
      <p className="mt-2 rounded-[var(--radius)] border bg-muted/40 p-4 text-lg leading-relaxed">
        {picked === null ? (
          <>
            {sentence.split("____")[0]}
            <span className="mx-1 rounded bg-primary/15 px-3 py-0.5 font-semibold text-primary">?</span>
            {sentence.split("____")[1]}
          </>
        ) : (
          <span className={correct ? "text-success" : "text-destructive"}>{filled}</span>
        )}
      </p>
      {gloss && <p className="mt-1 text-sm italic text-muted-foreground">{gloss}</p>}

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const isAnswer = opt === entry.headword;
          const isPicked = picked === opt;
          const reveal = picked !== null;
          return (
            <motion.button
              key={opt}
              type="button"
              disabled={reveal}
              onClick={() => setPicked(opt)}
              whileTap={{ scale: 0.97 }}
              animate={reveal && isPicked ? (correct ? POP : SHAKE) : undefined}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[var(--radius)] border px-4 py-3 text-center font-medium transition-colors",
                !reveal && "hover:border-primary/50",
                reveal && isAnswer && "border-success/50 bg-success/10 text-success",
                reveal && isPicked && !isAnswer && "border-destructive/50 bg-destructive/10 text-destructive",
              )}
            >
              {opt}
              {reveal && isAnswer && <Check className="size-4" />}
              {reveal && isPicked && !isAnswer && <X className="size-4" />}
            </motion.button>
          );
        })}
      </div>

      {picked !== null && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{entry.headword}</span> — {entry.meaningEn}
          </p>
          <Button size="sm" onClick={() => onDone(correct)}>
            Continue <ArrowRight />
          </Button>
        </motion.div>
      )}
      <span aria-live="polite" className="sr-only">
        {picked === null ? "" : correct ? "Correct" : `Incorrect, the answer is ${entry.headword}`}
      </span>
    </div>
  );
}
