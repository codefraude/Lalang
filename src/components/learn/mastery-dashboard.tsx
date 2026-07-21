"use client";

import { motion } from "framer-motion";
import { Award, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/learn/progress-ring";
import { CountUp } from "@/components/learn/count-up";
import { categoryStyle } from "@/components/learn/category-kit";
import { LEVEL_META, LEVELS, type Level } from "@/types/translation";
import type { Mastery } from "@/lib/learn-progress";
import type { DictionaryCategory } from "@/services/translation";

function MasteryRing({ label, mastery }: { label: string; mastery: Mastery }) {
  const pct = mastery.total ? mastery.learned / mastery.total : 0;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center gap-1.5"
    >
      <ProgressRing value={pct} size={64} stroke={6}>
        <span className="text-xs font-semibold">
          <CountUp to={mastery.learned} />/{mastery.total}
        </span>
      </ProgressRing>
      <span className="text-center text-xs text-muted-foreground">{label}</span>
    </motion.div>
  );
}

interface Props {
  byLevel: Record<Level, Mastery>;
  byCategory: Array<{ category: DictionaryCategory; mastery: Mastery }>;
  records: { bestScorePct: number; longestStreak: number };
}

/** Read-only reflection surface: per-level + per-category rings and records. */
export function MasteryDashboard({ byLevel, byCategory, records }: Props) {
  return (
    <section aria-label="Your mastery">
      <h2 className="font-display text-xl font-bold">Your mastery</h2>

      <Card className="mt-4 p-5">
        <div className="grid grid-cols-3 gap-4">
          {LEVELS.map((lv) => (
            <MasteryRing key={lv} label={LEVEL_META[lv].label} mastery={byLevel[lv]} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-5 border-t pt-6">
          {byCategory.map(({ category, mastery }) => (
            <MasteryRing key={category} label={categoryStyle(category).label} mastery={mastery} />
          ))}
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm">
          <Flame className="size-4 text-accent" />
          <span className="font-semibold">{records.longestStreak}</span> best streak
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm">
          <Award className="size-4 text-primary" />
          <span className="font-semibold">{Math.round(records.bestScorePct * 100)}%</span> best round
        </span>
      </div>
    </section>
  );
}
