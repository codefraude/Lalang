"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabList } from "@/components/learn/vocab-list";
import { WordQuiz } from "@/components/learn/word-quiz";
import { DICTIONARY_ENTRIES } from "@/services/translation";
import { LANGUAGE_META, LEVELS, LEVEL_META, type Level } from "@/types/translation";

function dayIndex(length: number) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const day = Math.floor(diff / 86_400_000);
  return day % length;
}

export default function LearnPage() {
  const [level, setLevel] = React.useState<Level>("beginner");

  const daily = DICTIONARY_ENTRIES[dayIndex(DICTIONARY_ENTRIES.length)];
  const levelEntries = React.useMemo(
    () => DICTIONARY_ENTRIES.filter((entry) => entry.level === level),
    [level],
  );

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-display-md font-bold">Learn Creole</h1>
        <p className="mt-2 text-muted-foreground">
          A word a day keeps the language alive — now organised by level.
        </p>

        {/* Word of the day */}
        <Card className="mt-8 overflow-hidden shadow-md">
          <div className="lagoon-glow px-6 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Word of the day
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <h2 className="font-display text-3xl font-bold tracking-tight">
                {daily.headword}
              </h2>
              <span className="text-sm text-muted-foreground">
                {LANGUAGE_META[daily.language].flag} {LANGUAGE_META[daily.language].nativeLabel}
              </span>
            </div>
            {daily.pronunciation && (
              <p className="text-sm text-muted-foreground">/{daily.pronunciation}/</p>
            )}
          </div>
          <CardContent className="p-6">
            <p className="text-lg">{daily.meaningEn}</p>
            {daily.examples?.[0] && (
              <p className="mt-3 border-l-2 border-primary/40 pl-3 italic text-muted-foreground">
                {daily.examples[0]}
                {daily.examples[1] ? ` — ${daily.examples[1]}` : ""}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Level selector */}
        <div className="mt-8 flex flex-wrap gap-2">
          {LEVELS.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={level === value ? "default" : "outline"}
              onClick={() => setLevel(value)}
            >
              {LEVEL_META[value].label}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{LEVEL_META[level].hint}</p>

        {/* Vocabulary for the selected level */}
        <div className="mt-4">
          <VocabList entries={levelEntries} />
        </div>

        {/* Quiz drawn from the selected level (remounts on level change) */}
        <WordQuiz key={level} entries={levelEntries} />
      </main>
    </div>
  );
}
