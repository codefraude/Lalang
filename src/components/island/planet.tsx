"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

const MAURITIUS =
  "M50 5 C67 6 82 18 85 38 C88 58 77 80 57 91 C41 99 21 94 13 76 C6 60 12 41 21 29 C29 18 39 5 50 5 Z";

/** The cinematic centrepiece: Earth zooms in and dissolves to reveal a glowing
 *  Mauritius as you scroll. Under reduced-motion it simply shows the island. */
export function Planet({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const earthScale = useTransform(progress, [0, 1], [1, 2.8]);
  const earthOpacity = useTransform(progress, [0, 0.5], [1, 0]);
  const islandOpacity = useTransform(progress, [0.3, 0.62], [0, 1]);
  const islandScale = useTransform(progress, [0.3, 1], [0.72, 1.06]);

  return (
    <div className="pointer-events-none relative mx-auto grid size-[min(64vw,20rem)] place-items-center">
      {!reduce && (
        <motion.div style={{ scale: earthScale, opacity: earthOpacity }} className="absolute inset-0 grid place-items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
            className="relative size-[64%] overflow-hidden rounded-full"
            style={{
              background: "radial-gradient(35% 35% at 34% 28%, #34b0ff 0%, #0b63b6 46%, #041a3a 100%)",
              boxShadow: "0 0 60px 8px rgba(0,212,255,0.35), inset -18px -12px 42px rgba(0,0,0,0.6)",
            }}
          >
            <span className="absolute left-[20%] top-[28%] size-[28%] rounded-full bg-[#00A86B]/70 blur-[1px]" />
            <span className="absolute right-[18%] top-[54%] size-[22%] rounded-[42%] bg-[#00A86B]/60 blur-[1px]" />
            <span className="absolute left-[48%] top-[16%] size-[14%] rounded-full bg-[#00A86B]/50 blur-[1px]" />
          </motion.div>
        </motion.div>
      )}

      <motion.div style={reduce ? undefined : { opacity: islandOpacity, scale: islandScale }} className="absolute inset-0 grid place-items-center">
        <svg viewBox="0 0 100 100" className="size-[62%] drop-shadow-[0_0_30px_rgba(0,212,255,0.55)]" aria-hidden>
          <defs>
            <linearGradient id="isl-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#00D4FF" />
              <stop offset="1" stopColor="#00A86B" />
            </linearGradient>
          </defs>
          <motion.path
            d={MAURITIUS}
            fill="url(#isl-grad)"
            stroke="#a5f3ff"
            strokeWidth="1.4"
            animate={reduce ? undefined : { opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
