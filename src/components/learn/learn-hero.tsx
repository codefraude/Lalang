"use client";

import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { WordOfDay } from "@/components/learn/word-of-day";
import { StatTile } from "@/components/learn/stat-tile";
import { containerStagger, riseItem } from "@/components/learn/motion";
import type { SeedDictionaryEntry } from "@/services/translation";

interface LearnHeroProps {
  daily: SeedDictionaryEntry;
  streak: number;
  today: number;
  goal: number;
  learned: number;
  mastered: number;
  total: number;
  currentLabel: string;
  onContinue: () => void;
}

/** Bento command deck: focal word-of-day + streak/mastery stats + a CTA that
 *  jumps to the current point on the journey. */
export function LearnHero({
  daily,
  streak,
  today,
  goal,
  learned,
  mastered,
  total,
  currentLabel,
  onContinue,
}: LearnHeroProps) {
  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="grid gap-3 sm:gap-4 md:auto-rows-[minmax(6.5rem,1fr)] md:grid-cols-4"
    >
      <motion.div variants={riseItem} className="md:col-span-2 md:row-span-2">
        <WordOfDay entry={daily} />
      </motion.div>

      <motion.div variants={riseItem} whileHover={{ y: -4 }} className="md:col-span-2">
        <StatTile variant="streak" streak={streak} today={today} goal={goal} />
      </motion.div>

      <motion.div variants={riseItem} whileHover={{ y: -4 }}>
        <StatTile variant="mastery" learned={learned} mastered={mastered} total={total} />
      </motion.div>

      <motion.button
        type="button"
        variants={riseItem}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="group flex h-full flex-col justify-between rounded-[var(--radius)] bg-primary p-4 text-left text-primary-foreground shadow-primary transition-shadow hover:shadow-lg"
      >
        <Compass className="size-5 opacity-90" />
        <span>
          <span className="flex items-center gap-1 font-semibold">
            Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="text-xs text-primary-foreground/80">{currentLabel}</span>
        </span>
      </motion.button>
    </motion.div>
  );
}
