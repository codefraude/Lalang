"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SeedDictionaryEntry } from "@/services/translation";

const DISTRACTOR_COUNT = 2;
const MIN_ENTRIES_FOR_QUIZ = DISTRACTOR_COUNT + 1;

interface WordQuizProps {
  entries: SeedDictionaryEntry[];
}

function buildQuestion(entries: SeedDictionaryEntry[]) {
  if (entries.length === 0) return null;
  const word = entries[Math.floor(Math.random() * entries.length)];
  const distractors = entries
    .filter((entry) => entry.meaningEn !== word.meaningEn)
    .sort(() => Math.random() - 0.5)
    .slice(0, DISTRACTOR_COUNT)
    .map((entry) => entry.meaningEn);
  const options = [word.meaningEn, ...distractors].sort(() => Math.random() - 0.5);
  return { word, options, answer: word.meaningEn };
}

export function WordQuiz({ entries }: WordQuizProps) {
  const [round, setRound] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);
  const question = React.useMemo(() => buildQuestion(entries), [entries, round]);

  const goToNextWord = () => {
    setPicked(null);
    setRound((current) => current + 1);
  };

  if (!question || entries.length < MIN_ENTRIES_FOR_QUIZ) return null;

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="font-semibold">Quick quiz</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          What does <span className="font-medium text-foreground">{question.word.headword}</span> mean?
        </p>
        <div className="mt-4 space-y-2">
          {question.options.map((option) => {
            const isAnswer = option === question.answer;
            const isPicked = picked === option;
            return (
              <motion.button
                key={option}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPicked(option)}
                disabled={picked !== null}
                className={cn(
                  "w-full rounded-[calc(var(--radius)-0.25rem)] border px-4 py-3 text-left text-sm transition-colors",
                  picked === null && "hover:border-primary/50",
                  picked !== null && isAnswer && "border-primary bg-primary/10",
                  isPicked && !isAnswer && "border-destructive bg-destructive/10",
                )}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
        {picked && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm">
              {picked === question.answer ? "✅ Correct — nice!" : "❌ Not quite."}
            </p>
            <Button size="sm" variant="outline" onClick={goToNextWord}>
              Next word
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
