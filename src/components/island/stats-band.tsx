"use client";

import { motion } from "framer-motion";
import { containerStagger, riseItem } from "@/components/learn/motion";

export interface Stat {
  value: string;
  label: string;
  note?: string;
}

/** A row of headline figures that stagger in and lift on hover. */
export function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5"
    >
      {stats.map((s) => (
        <motion.div key={s.label} variants={riseItem} whileHover={{ y: -4 }} className="text-center">
          <p className="gradient-text font-display text-3xl font-bold sm:text-4xl">{s.value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
          {s.note && <p className="mt-0.5 text-[11px] text-muted-foreground/70">{s.note}</p>}
        </motion.div>
      ))}
    </motion.div>
  );
}
