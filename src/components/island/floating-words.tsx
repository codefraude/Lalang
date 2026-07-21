"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HERO_WORDS } from "@/components/island/island-data";

// Distribute the words on a loose ellipse so they read as "orbiting the globe".
// Positions are rounded to a fixed precision: Math.cos/sin differ by a ULP
// across JS engines, which would otherwise cause an SSR/client hydration mismatch.
const RING = HERO_WORDS.map((word, i) => {
  const a = (i / HERO_WORDS.length) * Math.PI * 2;
  return {
    word,
    left: (50 + Math.cos(a) * 43).toFixed(2),
    top: (50 + Math.sin(a) * 39).toFixed(2),
    delay: (i % 6) * 0.35,
  };
});

/** Decorative Creole words drifting around the Earth (aria-hidden ambiance). */
export function FloatingWords() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {RING.map((r) => (
        <motion.span
          key={r.word}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-[#bfefff] backdrop-blur-sm sm:text-sm"
          style={{ left: `${r.left}%`, top: `${r.top}%` }}
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.7 } : { opacity: [0.35, 0.85, 0.35], y: [0, -10, 0], scale: [1, 1.04, 1] }}
          transition={reduce ? { duration: 0.4 } : { duration: 7 + r.delay * 2, repeat: Infinity, ease: "easeInOut", delay: r.delay }}
        >
          {r.word}
        </motion.span>
      ))}
    </div>
  );
}
