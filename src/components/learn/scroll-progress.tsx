"use client";

import { motion, useScroll } from "framer-motion";

/** Thin teal→amber reading-progress bar pinned to the top of the viewport.
 *  Position-based (scaleX), so it still fills correctly under reduced-motion. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-gradient-to-r from-primary to-accent"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
