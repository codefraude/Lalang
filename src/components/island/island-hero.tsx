"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { Starfield } from "@/components/island/starfield";
import { Planet } from "@/components/island/planet";
import { FloatingWords } from "@/components/island/floating-words";

// Three.js loads ONLY here, and only after paint — the rest of the app stays lean.
const HeroCanvas = dynamic(() => import("@/components/island/webgl/hero-canvas"), {
  ssr: false,
  loading: () => <Starfield className="absolute inset-0 size-full" />,
});

function Fallback2D() {
  const progress = useMotionValue(0.62);
  return (
    <>
      <Starfield className="absolute inset-0 size-full" />
      <div className="absolute inset-0 grid place-items-center">
        <Planet progress={progress} />
      </div>
    </>
  );
}

export function IslandHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#020617] text-white">
      {/* Absolute wrapper gives the R3F canvas a DEFINITE height (min-h alone
          collapses its height:100%, shrinking the scene to a strip). */}
      <div className="absolute inset-0">{reduce ? <Fallback2D /> : <HeroCanvas />}</div>
      <FloatingWords />

      {/* Legibility scrim so the headline reads over the globe's lower half. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end gap-4 px-4 pb-[11svh] text-center">
        <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-[#bfefff] backdrop-blur">
          <Sparkles className="size-3.5" /> A living language universe
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mx-auto max-w-[15ch] text-balance font-display text-[clamp(2rem,7vw,4rem)] font-bold leading-[1.05] tracking-tight"
        >
          Discover the{" "}
          <span style={{ background: "linear-gradient(100deg,#00D4FF,#FF8C42)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            soul of our island
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="max-w-md text-balance text-sm text-white/75 sm:text-base">
          Travel from space to the shores of Mauritius and explore English, French and Kreol Morisien — living culture,
          not words on a page.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="pointer-events-auto mt-1 flex flex-wrap items-center justify-center gap-3">
          <a href="#journey" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#02121f] shadow-lg transition-transform hover:scale-[1.03]" style={{ background: "linear-gradient(100deg,#00D4FF,#00A86B)" }}>
            Enter Mauritius <ArrowDown className="size-4" />
          </a>
          <Link href="/translator" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10">
            Open the translator
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
