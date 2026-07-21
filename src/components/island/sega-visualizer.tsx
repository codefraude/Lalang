"use client";

import { motion, useReducedMotion } from "framer-motion";

const BARS = [0.4, 0.7, 0.5, 0.9, 0.6, 0.85, 0.45, 0.75, 0.55, 0.8, 0.5, 0.7, 0.6];

/** A Sega rhythm equalizer — pure CSS/motion, no audio dependency. */
export function SegaVisualizer() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="flex h-24 items-end justify-center gap-1.5">
      {BARS.map((base, i) => (
        <motion.span
          key={i}
          className="w-2 rounded-full"
          style={{ background: "linear-gradient(to top,#FF8C42,#00D4FF)" }}
          initial={{ height: `${base * 45}%` }}
          animate={reduce ? { height: `${base * 60}%` } : { height: [`${base * 28}%`, `${base * 100}%`, `${base * 42}%`] }}
          transition={reduce ? { duration: 0 } : { duration: 0.9 + (i % 4) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }}
        />
      ))}
    </div>
  );
}
