"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH } from "@/components/learn/motion";

/**
 * Reusable 3D flip primitive. The caller MUST give it a height (e.g. `h-full`
 * or `h-64`) because both faces are absolutely positioned. Under reduced-motion
 * the rotation becomes a crossfade. If `onFlip` is provided it behaves as a
 * keyboard-operable button.
 */
export function FlipCard({
  flipped,
  onFlip,
  front,
  back,
  className,
  ariaLabel,
}: {
  flipped: boolean;
  onFlip?: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();

  const interactive = onFlip
    ? {
        role: "button" as const,
        "aria-pressed": flipped,
        "aria-label": ariaLabel,
        tabIndex: 0,
        onClick: onFlip,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFlip();
          }
        },
      }
    : {};

  if (reduce) {
    return (
      <div className={cn("relative", onFlip && "cursor-pointer", className)} {...interactive}>
        <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: flipped ? 0 : 1 }}>
          {front}
        </div>
        <div className="absolute inset-0 transition-opacity duration-200" style={{ opacity: flipped ? 1 : 0 }}>
          {back}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", onFlip && "cursor-pointer", className)} style={{ perspective: 1200 }} {...interactive}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={SPRING_SMOOTH}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
          {front}
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
