"use client";

import * as React from "react";
import { Shuffle, Sparkles } from "lucide-react";
import { FlipCard } from "@/components/learn/flip-card";
import { useSpotlight } from "@/components/learn/use-spotlight";
import { categoryStyle } from "@/components/learn/category-kit";
import { Button } from "@/components/ui/button";
import { LANGUAGE_META } from "@/types/translation";
import type { SeedDictionaryEntry } from "@/services/translation";
import { cn } from "@/lib/utils";

const FACE = "relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[var(--radius)] border bg-card p-5 shadow-md";

/** "Discover a word" — a flippable random-word card with a shuffle button. */
export function WordSpotlight({ entries }: { entries: SeedDictionaryEntry[] }) {
  const [i, setI] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const { ref, onPointerMove } = useSpotlight<HTMLDivElement>();

  const shuffle = React.useCallback(() => {
    setFlipped(false);
    setI(Math.floor(Math.random() * entries.length));
  }, [entries.length]);

  // Pick a random word on mount (client only → no SSR hydration mismatch).
  React.useEffect(() => {
    setI(Math.floor(Math.random() * entries.length));
  }, [entries.length]);

  const entry = entries[i] ?? entries[0];
  if (!entry) return null;
  const cat = categoryStyle(entry.category);
  const Icon = cat.icon;
  const meta = LANGUAGE_META[entry.language];

  return (
    <div className="flex flex-col gap-3">
      <div ref={ref} onPointerMove={onPointerMove} className="group relative h-52">
        <FlipCard
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          ariaLabel={`Discover: ${entry.headword}. Activate to reveal the meaning.`}
          className="h-full"
          front={
            <div className={FACE}>
              <div className="lagoon-glow pointer-events-none absolute inset-0" aria-hidden />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(240px circle at var(--mx,50%) var(--my,0%), hsl(var(--accent)/0.16), transparent 65%)" }}
              />
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="size-3.5" /> Discover a word
                </span>
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cat.chip)}>
                  <Icon className="size-3" /> {cat.label}
                </span>
              </div>
              <h2 className="relative shimmer-text font-display text-4xl font-bold tracking-tight">{entry.headword}</h2>
              <p className="relative text-sm text-muted-foreground">
                {meta.flag} {meta.nativeLabel}
                {entry.pronunciation ? ` · /${entry.pronunciation}/` : ""} · <span className="text-foreground/60">tap to flip</span>
              </p>
            </div>
          }
          back={
            <div className={cn(FACE, "bg-primary/5")}>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Meaning</span>
              <div>
                <p className="text-2xl font-semibold">{entry.meaningEn}</p>
                {entry.meaningFr && <p className="mt-1 text-muted-foreground">{entry.meaningFr}</p>}
              </div>
              {entry.examples?.[0] ? (
                <p className="border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
                  {entry.examples[0]}
                  {entry.examples[1] ? ` — ${entry.examples[1]}` : ""}
                </p>
              ) : (
                <span />
              )}
            </div>
          }
        />
      </div>
      <Button variant="outline" size="sm" onClick={shuffle} className="self-start">
        <Shuffle className="size-4" /> Another word
      </Button>
    </div>
  );
}
