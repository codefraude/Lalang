"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bird, X } from "lucide-react";
import { LALA_TIPS } from "@/components/island/island-data";

/** "Lala" — the AI language guardian: a glowing orb that cycles friendly tips. */
export function LalaOrb() {
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(true);
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setI((n) => (n + 1) % LALA_TIPS.length), 6000);
    return () => clearInterval(t);
  }, [open]);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="max-w-[15rem] rounded-2xl rounded-br-sm border bg-card/95 p-3 shadow-lg backdrop-blur"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-primary">Lala · your guide</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Dismiss Lala" className="text-muted-foreground hover:text-foreground">
                <X className="size-3.5" />
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 text-sm text-muted-foreground">
                {LALA_TIPS[i]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Lala, your language guide"
        className="relative grid size-14 shrink-0 place-items-center rounded-full"
        style={{ background: "radial-gradient(circle at 34% 28%, #a5f3ff, #00A86B 72%)", boxShadow: "0 0 26px rgba(0,212,255,0.55)" }}
      >
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-[#a5f3ff]/60"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <Bird className="size-6 text-white" />
      </button>
    </div>
  );
}
