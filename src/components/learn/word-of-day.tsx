"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { FlipCard } from "@/components/learn/flip-card";
import { useSpotlight } from "@/components/learn/use-spotlight";
import { categoryStyle } from "@/components/learn/category-kit";
import { LANGUAGE_META } from "@/types/translation";
import type { SeedDictionaryEntry } from "@/services/translation";
import { cn } from "@/lib/utils";

const FACE = "relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[var(--radius)] border bg-card p-6 shadow-md";

/** Focal bento tile: the daily word flips 3D from Kreol to its meaning, with a
 *  shimmering headword and a teal→amber spotlight that follows the cursor. */
export function WordOfDay({ entry }: { entry: SeedDictionaryEntry }) {
  const [flipped, setFlipped] = React.useState(false);
  const { ref, onPointerMove } = useSpotlight<HTMLDivElement>();
  const cat = categoryStyle(entry.category);
  const Icon = cat.icon;
  const meta = LANGUAGE_META[entry.language];

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className="group relative h-full min-h-[15rem]"
    >
      <FlipCard
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
        ariaLabel={`Word of the day: ${entry.headword}. Activate to reveal the meaning.`}
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
                <Sparkles className="size-3.5" /> Word of the day
              </span>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cat.chip)}>
                <Icon className="size-3" /> {cat.label}
              </span>
            </div>
            <div className="relative">
              <h2 className="shimmer-text font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {entry.headword}
              </h2>
              {entry.pronunciation && <p className="mt-1 text-sm text-muted-foreground">/{entry.pronunciation}/</p>}
            </div>
            <p className="relative text-sm text-muted-foreground">
              {meta.flag} {meta.nativeLabel} · <span className="text-foreground/60">tap to flip</span>
            </p>
          </div>
        }
        back={
          <div className={cn(FACE, "bg-primary/5")}>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Meaning</span>
            <div>
              <p className="text-2xl font-semibold sm:text-3xl">{entry.meaningEn}</p>
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
  );
}
