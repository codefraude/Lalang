"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";
import { SHARD_COLORS } from "@/components/learn/motion";
import { cn } from "@/lib/utils";

export type CelebrationTier = "none" | "modest" | "perfect" | "milestone";

const SHARD_COUNT: Record<Exclude<CelebrationTier, "none">, number> = { modest: 18, perfect: 36, milestone: 46 };

/** Library-free confetti (deterministic spread, no canvas) + a milestone
 *  island-sunrise reveal. Auto-dismisses; fully static under reduced-motion. */
export function CelebrationOverlay({
  tier,
  milestone,
  onDone,
}: {
  tier: CelebrationTier;
  milestone?: number;
  onDone: () => void;
}) {
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (tier === "none") return;
    const t = window.setTimeout(onDone, tier === "milestone" ? 2200 : 1500);
    return () => window.clearTimeout(t);
  }, [tier, onDone]);

  const count = tier === "none" ? 0 : SHARD_COUNT[tier];
  const shards = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / Math.max(1, count)) * Math.PI * 2;
        const dist = 130 + (i % 5) * 42;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist + 70,
          rotate: (i * 47) % 360,
          color: SHARD_COLORS[i % SHARD_COLORS.length],
          delay: (i % 6) * 0.02,
        };
      }),
    [count],
  );

  if (tier === "none") return null;
  const message = tier === "milestone" ? `${milestone}-day streak!` : tier === "perfect" ? "Perfect round!" : "Nice work!";

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center" aria-hidden>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.12, 1, 1] }}
        transition={{ duration: reduce ? 0.6 : tier === "milestone" ? 2 : 1.4, times: [0, 0.2, 0.7, 1] }}
        className="flex flex-col items-center gap-3"
      >
        {tier === "milestone" ? (
          <Sunrise />
        ) : (
          <span className="grid size-16 place-items-center rounded-2xl bg-primary/15 text-primary shadow-lg">
            <Trophy className="size-8" />
          </span>
        )}
        <span className="gradient-text font-display text-2xl font-bold">{message}</span>
      </motion.div>

      {!reduce &&
        shards.map((s, i) => (
          <motion.span
            key={i}
            className={cn("absolute size-2 rounded-sm", s.color)}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: [1, 1, 0], x: s.x, y: s.y, rotate: s.rotate }}
            transition={{ duration: 1.2, delay: s.delay, ease: "easeOut" }}
          />
        ))}
    </div>
  );
}

function Sunrise() {
  const draw = { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 } };
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="text-accent drop-shadow">
      {Array.from({ length: 7 }).map((_, i) => {
        const a = Math.PI - (i / 6) * Math.PI;
        const x1 = 60 + Math.cos(a) * 30;
        const y1 = 60 - Math.sin(a) * 30;
        const x2 = 60 + Math.cos(a) * 42;
        const y2 = 60 - Math.sin(a) * 42;
        return (
          <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="3" strokeLinecap="round" {...draw} transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }} />
        );
      })}
      <motion.path d="M32 60 a28 28 0 0 1 56 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" {...draw} transition={{ duration: 0.7 }} />
      <motion.line x1="16" y1="62" x2="104" y2="62" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" {...draw} transition={{ duration: 0.6, delay: 0.2 }} />
    </svg>
  );
}
