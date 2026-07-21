import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion vocabulary so every Learn component feels "of one hand" and
 * each file stays tiny. Spring configs are tuned per role.
 */

export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 400, damping: 17 };
export const SPRING_SMOOTH: Transition = { type: "spring", stiffness: 120, damping: 20 };
export const SPRING_LAYOUT: Transition = { type: "spring", stiffness: 400, damping: 34 };

export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export const containerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING_SMOOTH },
};

/** Tactile answer-feedback keyframes. */
export const POP = { scale: [1, 1.12, 1] };
export const SHAKE = { x: [0, -6, 6, -4, 4, 0] };

/** Confetti shard colors — design tokens, so they adapt to light/dark. */
export const SHARD_COLORS = ["bg-primary", "bg-accent", "bg-success", "bg-info"] as const;
