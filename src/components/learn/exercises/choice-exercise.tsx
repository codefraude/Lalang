"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POP, SHAKE } from "@/components/learn/motion";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/components/learn/round-builder";

type ChoiceEx = Extract<Exercise, { kind: "choice" }>;

/** Multiple choice, in either direction, with tactile reveal + rich feedback. */
export function ChoiceExercise({ exercise, onDone }: { exercise: ChoiceEx; onDone: (correct: boolean) => void }) {
  const { entry, direction, options } = exercise;
  const answer = direction === "toEn" ? entry.meaningEn : entry.headword;
  const [picked, setPicked] = React.useState<string | null>(null);
  const correct = picked === answer;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {direction === "toEn" ? "Translate to English" : "Translate to Kreol"}
      </p>
      <p className="mt-1 text-lg">
        {direction === "toEn" ? (
          <>What does <span className="font-semibold text-primary">{entry.headword}</span> mean?</>
        ) : (
          <>Which word means <span className="font-semibold text-primary">&ldquo;{entry.meaningEn}&rdquo;</span>?</>
        )}
      </p>

      <div className="mt-4 space-y-2">
        {options.map((opt) => {
          const isAnswer = opt === answer;
          const isPicked = picked === opt;
          const reveal = picked !== null;
          return (
            <motion.button
              key={opt}
              type="button"
              disabled={reveal}
              onClick={() => setPicked(opt)}
              whileTap={{ scale: 0.98 }}
              animate={reveal && isPicked ? (correct ? POP : SHAKE) : undefined}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-[var(--radius)] border px-4 py-3 text-left transition-colors",
                !reveal && "hover:border-primary/50",
                reveal && isAnswer && "border-success/50 bg-success/10 text-success",
                reveal && isPicked && !isAnswer && "border-destructive/50 bg-destructive/10 text-destructive",
              )}
            >
              <span>{opt}</span>
              {reveal && isAnswer && <Check className="size-4 shrink-0" />}
              {reveal && isPicked && !isAnswer && <X className="size-4 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {picked !== null && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="rounded-[var(--radius)] bg-muted/60 p-3 text-sm">
            <p>
              <span className="font-semibold">{entry.headword}</span> — {entry.meaningEn}
              {entry.meaningFr ? ` · ${entry.meaningFr}` : ""}
            </p>
            {entry.examples?.[0] && (
              <p className="mt-1 italic text-muted-foreground">
                {entry.examples[0]}
                {entry.examples[1] ? ` — ${entry.examples[1]}` : ""}
              </p>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={() => onDone(correct)}>
              Continue <ArrowRight />
            </Button>
          </div>
        </motion.div>
      )}
      <span aria-live="polite" className="sr-only">
        {picked === null ? "" : correct ? "Correct" : `Incorrect, the answer is ${answer}`}
      </span>
    </div>
  );
}
