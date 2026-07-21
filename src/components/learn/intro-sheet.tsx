"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REASONS = [
  { key: "travel", label: "Travel & tourism", emoji: "🏝️" },
  { key: "roots", label: "Family & roots", emoji: "👪" },
  { key: "culture", label: "Culture & music", emoji: "🎶" },
];
const GOALS = [3, 5, 10];

/** One-time first-visit welcome: pick a reason + a daily goal, then start. */
export function IntroSheet({ onDone }: { onDone: (goal: number) => void }) {
  const [reason, setReason] = React.useState<string | null>(null);
  const [goal, setGoal] = React.useState(5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Learn"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border bg-card shadow-xl"
      >
        <div className="lagoon-glow p-6">
          <h2 className="gradient-text font-display text-2xl font-bold">Bienveni! 🌺</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Let&apos;s learn Kreol Morisien together. What brings you here?
          </p>

          <div className="mt-4 space-y-2">
            {REASONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setReason(r.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius)] border px-4 py-3 text-left text-sm transition-colors",
                  reason === r.key ? "border-primary bg-primary/10" : "hover:border-primary/40",
                )}
              >
                <span className="text-xl">{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm font-medium">Daily goal</p>
          <div className="mt-2 flex gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoal(g)}
                className={cn(
                  "flex-1 rounded-[var(--radius)] border py-2 text-sm font-semibold transition-colors",
                  goal === g ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40",
                )}
              >
                {g} words
              </button>
            ))}
          </div>

          <Button className="mt-6 w-full" size="lg" disabled={!reason} onClick={() => onDone(goal)}>
            Start learning
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
