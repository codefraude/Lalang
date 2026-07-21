"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { Starfield } from "@/components/island/starfield";
import { FloatingWords } from "@/components/island/floating-words";

const JourneyCanvas = dynamic(() => import("@/components/island/journey/journey-canvas"), {
  ssr: false,
  loading: () => <Starfield className="absolute inset-0 size-full" />,
});

const GRADIENT = { background: "linear-gradient(100deg,#00D4FF,#FF8C42)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } as const;
const CTA = { background: "linear-gradient(100deg,#00D4FF,#00A86B)" } as const;

function ReducedHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center gap-4 overflow-hidden bg-[#020617] px-4 text-center text-white">
      <Starfield className="absolute inset-0 size-full" />
      <h1 className="relative max-w-[15ch] text-balance font-display text-[clamp(2rem,7vw,4rem)] font-bold leading-[1.05]">
        Discover the <span style={GRADIENT}>soul of our island</span>
      </h1>
      <p className="relative max-w-md text-white/75">Explore English, French and Kreol Morisien — living culture, not words on a page.</p>
      <Link href="/translator" className="relative rounded-full px-6 py-3 text-sm font-semibold text-[#02121f]" style={CTA}>
        Open the translator
      </Link>
    </section>
  );
}

export function JourneyHero() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.6 });
  const orbitOpacity = useTransform(scrollYProgress, [0, 0.12, 0.24], [1, 1, 0]);
  const lagoonOpacity = useTransform(scrollYProgress, [0.62, 0.78, 1], [0, 1, 1]);
  const [atLagoon, setAtLagoon] = React.useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setAtLagoon((prev) => (prev === v > 0.55 ? prev : v > 0.55)));

  if (reduce) return <ReducedHero />;

  return (
    <section ref={ref} className="relative h-[320vh] bg-[#020617] text-white">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <JourneyCanvas progress={smooth} />

        {/* Deep-water fade: the canvas bottom melts to the exact night colour of
            the next section, so there is no bright→dark seam when it scrolls up. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent via-[#03202e]/70 to-[#020617]" />

        <motion.div style={{ opacity: orbitOpacity }} className="absolute inset-0">
          <FloatingWords />
        </motion.div>

        <motion.div style={{ opacity: orbitOpacity }} className="pointer-events-none absolute inset-x-0 top-[14%] flex flex-col items-center gap-4 px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-[#bfefff] backdrop-blur">
            <Sparkles className="size-3.5" /> A living language universe
          </span>
          <h1 className="max-w-[15ch] text-balance font-display text-[clamp(2rem,7vw,4rem)] font-bold leading-[1.05] tracking-tight drop-shadow-[0_2px_20px_rgba(2,6,23,0.6)]">
            Discover the <span style={GRADIENT}>soul of our island</span>
          </h1>
          <p className="flex items-center gap-2 text-sm text-white/70">
            Scroll to descend <ArrowDown className="size-4 animate-bounce" />
          </p>
        </motion.div>

        {atLagoon && (
          <motion.div style={{ opacity: lagoonOpacity }} className="pointer-events-none absolute inset-x-0 bottom-[26%] flex justify-center px-4">
            <div className="pointer-events-auto max-w-md rounded-2xl border border-white/15 bg-black/30 px-6 py-5 text-center backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#bfefff]">Bonzour 🌊 — welcome to the lagoon</span>
              <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Where our language was born</h2>
              <p className="mt-2 text-sm text-white/80">
                Kreol Morisien rose where the Indian Ocean met a hundred journeys — African, Indian, French, Chinese.
              </p>
              <Link href="/translator" className="mt-4 inline-block rounded-full px-6 py-3 text-sm font-semibold text-[#02121f] shadow-lg transition-transform hover:scale-[1.03]" style={CTA}>
                Speak Kreol
              </Link>
            </div>
          </motion.div>
        )}

        <a href="#journey" className="pointer-events-auto absolute right-4 top-4 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs text-white/80 backdrop-blur transition-colors hover:bg-white/10">
          Skip the journey ↓
        </a>
      </div>
    </section>
  );
}
