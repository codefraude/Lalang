"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatsBand } from "@/components/island/stats-band";
import { HeritageTimeline } from "@/components/island/heritage-timeline";
import { containerStagger, riseItem } from "@/components/learn/motion";
import { DIVERSITY, FACTS, INTRO, LANGUAGES, QUOTE, STATS, TIMELINE } from "@/components/island/facts-data";

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MauritiusInfo() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <Reveal className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">The island</p>
        <h2 className="mt-3 font-display text-display-md font-bold">
          A small island with a <span className="gradient-text">big story</span>
        </h2>
        <p className="mt-4 text-muted-foreground">{INTRO}</p>
      </Reveal>

      <div className="mt-14">
        <StatsBand stats={STATS} />
      </div>

      <div className="mt-24 grid gap-8 md:grid-cols-2 md:items-center">
        <Reveal>
          <h3 className="font-display text-2xl font-bold sm:text-3xl">{LANGUAGES.headline}</h3>
          <p className="mt-3 text-muted-foreground">{LANGUAGES.body}</p>
        </Reveal>
        <motion.ul variants={containerStagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-3">
          {LANGUAGES.points.map((p) => (
            <motion.li key={p} variants={riseItem} className="flex gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{p}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <div className="mt-24">
        <Reveal>
          <h3 className="font-display text-2xl font-bold sm:text-3xl">One island, many journeys</h3>
          <p className="mt-2 max-w-xl text-muted-foreground">The people who became Mauritius — and what each brought.</p>
        </Reveal>
        <motion.div variants={containerStagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIVERSITY.map((d, i) => (
            <motion.div key={d.name} variants={riseItem} whileHover={{ y: -4 }} className={cn(i % 2 === 1 && "lg:mt-10")}>
              <Card className="h-full p-5">
                <h4 className="font-display font-bold text-primary">{d.name}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{d.contribution}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mt-24">
        <Reveal className="text-center">
          <h3 className="font-display text-2xl font-bold sm:text-3xl">A shared history</h3>
        </Reveal>
        <div className="mt-12">
          <HeritageTimeline items={TIMELINE} />
        </div>
      </div>

      <Reveal className="mt-24 max-w-3xl border-l-2 border-primary/40 pl-6">
        <Quote className="size-10 text-primary/30" />
        <p className="mt-3 font-display text-2xl font-medium leading-snug sm:text-3xl">{QUOTE.text}</p>
        <footer className="mt-4 text-sm text-muted-foreground">— {QUOTE.author}</footer>
      </Reveal>

      <div className="mt-24">
        <Reveal className="text-center">
          <h3 className="font-display text-2xl font-bold sm:text-3xl">Did you know?</h3>
        </Reveal>
        <motion.div variants={containerStagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map((f) => (
            <motion.div key={f.title} variants={riseItem}>
              <Card interactive className="h-full p-5">
                <h4 className="font-semibold">{f.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
