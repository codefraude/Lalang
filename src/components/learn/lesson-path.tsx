"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PathNode } from "@/components/learn/path-node";
import { unitStatus, type Unit } from "@/lib/learn-progress";
import { EASE_PREMIUM } from "@/components/learn/motion";
import { LEVEL_META, type Level } from "@/types/translation";
import { cn } from "@/lib/utils";

function LevelBanner({ level }: { level: Level }) {
  return (
    <div className="relative z-10 py-1 text-center">
      <span className="glass inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm">
        {LEVEL_META[level].label} · {LEVEL_META[level].hint}
      </span>
    </div>
  );
}

/** The serpentine journey: units alternate left/right down a drawn-in central
 *  trail, grouped under level banners, with a sticky progress pill. */
export function LessonPath({
  units,
  completed,
  currentId,
  onOpenUnit,
  currentRef,
}: {
  units: Unit[];
  completed: number[];
  currentId: number;
  onOpenUnit: (unit: Unit) => void;
  currentRef?: React.Ref<HTMLDivElement>;
}) {
  const currentLevel = units.find((u) => u.id === currentId)?.level ?? "beginner";
  let lastLevel: Level | null = null;

  // Only render history + the current unit + a short lookahead of locked units.
  // Keeps the trail focused and fast even with hundreds of units.
  const LOOKAHEAD = 8;
  const visibleEnd = Math.min(units.length, currentId + 1 + LOOKAHEAD);
  const visible = units.slice(0, visibleEnd);
  const hiddenAhead = units.length - visibleEnd;

  return (
    <section aria-label="Your learning journey">
      <div className="sticky top-4 z-20 mb-6 flex justify-center">
        <div className="glass inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm shadow-sm">
          <span className="font-semibold text-primary">
            {completed.length} / {units.length}
          </span>
          <span className="text-muted-foreground">units · {LEVEL_META[currentLevel].label}</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-xl">
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-2 h-[calc(100%-1rem)] w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/40 via-border to-accent/40"
          style={{ originY: 0 }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE_PREMIUM }}
        />

        <div className="relative flex flex-col gap-7">
          {visible.map((unit, i) => {
            const status = unitStatus(unit.id, completed, currentId);
            const side = i % 2 === 0 ? "left" : "right";
            const banner = unit.level !== lastLevel ? unit.level : null;
            lastLevel = unit.level;
            return (
              <React.Fragment key={unit.id}>
                {banner && <LevelBanner level={banner} />}
                <motion.div
                  ref={unit.id === currentId ? currentRef : undefined}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8% 0px" }}
                  transition={{ duration: 0.4, ease: EASE_PREMIUM }}
                  className={cn(
                    "flex w-full scroll-mt-24",
                    side === "left" ? "justify-start pl-4 sm:pl-16" : "justify-end pr-4 sm:pr-16",
                  )}
                >
                  <PathNode unit={unit} status={status} onOpen={() => onOpenUnit(unit)} />
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {hiddenAhead > 0 && (
          <p className="relative mt-8 text-center text-sm text-muted-foreground">
            🔒 {hiddenAhead} more {hiddenAhead === 1 ? "unit" : "units"} ahead — keep going to unlock them.
          </p>
        )}
      </div>
    </section>
  );
}
