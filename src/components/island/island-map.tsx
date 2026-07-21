"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { REGIONS, type Region } from "@/components/island/island-data";
import { cn } from "@/lib/utils";

const MAURITIUS =
  "M50 5 C67 6 82 18 85 38 C88 58 77 80 57 91 C41 99 21 94 13 76 C6 60 12 41 21 29 C29 18 39 5 50 5 Z";

export function IslandMap() {
  const [active, setActive] = React.useState<Region>(REGIONS[0]);

  return (
    <section className="bg-[#020617] px-4 pb-24 pt-10 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Explore the island</p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Every region has its words.</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/60">Tap a glowing point to travel across Mauritius — from the capital to the sacred lake.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl items-center gap-10 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <svg viewBox="0 0 100 100" className="size-full drop-shadow-[0_0_30px_rgba(0,212,255,0.25)]" aria-hidden>
            <defs>
              <linearGradient id="map-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#00D4FF" />
                <stop offset="1" stopColor="#00A86B" />
              </linearGradient>
            </defs>
            <path d={MAURITIUS} fill="url(#map-grad)" fillOpacity="0.16" stroke="#00D4FF" strokeWidth="0.8" />
          </svg>
          {REGIONS.map((r) => {
            const on = active.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActive(r)}
                aria-label={r.name}
                aria-pressed={on}
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2"
              >
                <span className={cn("block size-3 rounded-full ring-4 transition-all", on ? "scale-125 bg-[#FF8C42] ring-[#FF8C42]/30" : "bg-[#00D4FF] ring-[#00D4FF]/20")} />
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-left backdrop-blur"
          >
            <h3 className="font-display text-2xl font-bold">{active.name}</h3>
            <p className="mt-2 text-sm text-white/75">{active.blurb}</p>
            <p className="mt-3 text-sm text-white/55">{active.note}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {active.words.map((w) => (
                <span key={w.word} className="inline-flex items-center gap-1.5 rounded-full bg-[#00D4FF]/10 px-2.5 py-1 text-sm">
                  <span className="font-semibold text-[#7ff0ff]">{w.word}</span>
                  <span className="text-white/55">— {w.meaning}</span>
                </span>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.tags.map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-white/60">{t}</span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActive(r)}
                  className={cn("rounded-full border px-2.5 py-1 text-xs transition-colors", active.id === r.id ? "border-[#00D4FF] text-[#7ff0ff]" : "border-white/15 text-white/60 hover:border-white/40")}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
