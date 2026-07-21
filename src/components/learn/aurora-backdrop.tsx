"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Fixed, drifting lagoon-teal + volcanic-amber ambient glow behind the page.
 *  Purely decorative; a single static frame under reduced-motion. */
export function AuroraBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : y }}>
        <motion.div
          className="absolute -left-1/4 -top-1/4 size-[80vmax] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.6), transparent 60%)" }}
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-1/4 top-1/3 size-[70vmax] rounded-full opacity-[0.14] blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--accent)/0.6), transparent 60%)" }}
          animate={reduce ? undefined : { x: [0, -36, 0], y: [0, 24, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
