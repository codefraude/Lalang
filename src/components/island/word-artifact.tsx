"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { IslandWord } from "@/components/island/island-data";

/** A Creole word rendered as a cultural artifact: tap to unfold its meaning. */
export function WordArtifact({ item }: { item: IslandWord }) {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.button
      layout
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className="group rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left backdrop-blur transition-colors hover:border-[#00D4FF]/50"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-xl font-semibold">{item.word}</span>
        <Sparkles className="size-4 text-[#7ff0ff] opacity-40 transition-opacity group-hover:opacity-100" />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="mt-2 text-sm text-white/80">{item.meaning}</p>
            <p className="mt-1 text-xs text-white/50">{item.note}</p>
            {item.example && <p className="mt-2 border-l-2 border-[#00D4FF]/50 pl-2 text-xs italic text-white/60">{item.example}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
