"use client";

import { MotionConfig } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { AuroraBackdrop } from "@/components/learn/aurora-backdrop";
import { ScrollProgress } from "@/components/learn/scroll-progress";
import { TranslatorHero } from "@/components/translator/translator-hero";
import { TranslatorPanel } from "@/components/translator/translator-panel";
import { DICTIONARY_ENTRIES } from "@/services/translation";

const PIPELINE = ["Detect language", "Analyse context", "AI translate", "Fix grammar", "Adapt culturally"];

export default function TranslatorPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        <ScrollProgress />
        <AuroraBackdrop />
        <SiteHeader />

        <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <TranslatorHero wordCount={DICTIONARY_ENTRIES.length} />

          <div className="mt-10">
            <TranslatorPanel />
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide">Pipeline</span>
            {PIPELINE.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border bg-card/60 px-2.5 py-1">{step}</span>
                {i < PIPELINE.length - 1 && <span aria-hidden>→</span>}
              </span>
            ))}
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
