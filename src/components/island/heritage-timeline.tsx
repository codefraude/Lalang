"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Milestone {
  year: string;
  title: string;
  detail: string;
}

/** A vertical, alternating heritage timeline that reveals as you scroll. */
export function HeritageTimeline({ items }: { items: Milestone[] }) {
  return (
    <div className="relative mx-auto max-w-2xl">
      <div aria-hidden className="absolute left-3 top-1 h-full w-px bg-gradient-to-b from-primary/40 via-border to-accent/40 sm:left-1/2 sm:-translate-x-1/2" />
      <div className="space-y-8">
        {items.map((m, i) => {
          const right = i % 2 === 1;
          return (
            <motion.div
              key={`${m.year}-${m.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn("relative pl-10 sm:w-1/2 sm:pl-0", right ? "sm:ml-auto sm:pl-10" : "sm:pr-10 sm:text-right")}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1.5 size-3 rounded-full bg-primary ring-4 ring-primary/15",
                  "left-[0.35rem] sm:left-auto",
                  right ? "sm:-left-1.5" : "sm:-right-1.5",
                )}
              />
              <p className="font-display text-xl font-bold text-primary">{m.year}</p>
              <p className="mt-0.5 font-semibold">{m.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{m.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
