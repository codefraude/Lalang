"use client";

import * as React from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";

/**
 * Animated integer that eases from its previous value to `to`. Used for XP,
 * streaks and "words mastered" counters. Respects prefers-reduced-motion by
 * snapping straight to the value.
 */
export function CountUp({
  to,
  duration = 1,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = String(Math.round(to));
      return;
    }
    const controls = animate(mv, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [to, duration, reduce, mv]);

  return (
    <span ref={ref} className={className}>
      {reduce ? Math.round(to) : 0}
    </span>
  );
}
