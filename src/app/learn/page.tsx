"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AuroraBackdrop } from "@/components/learn/aurora-backdrop";
import { ScrollProgress } from "@/components/learn/scroll-progress";
import { LearnHero } from "@/components/learn/learn-hero";
import { LessonPath } from "@/components/learn/lesson-path";
import { PracticeSession } from "@/components/learn/practice-session";
import { FlashcardDeck } from "@/components/learn/flashcard-deck";
import { MasteryDashboard } from "@/components/learn/mastery-dashboard";
import { IntroSheet } from "@/components/learn/intro-sheet";
import { CelebrationOverlay, type CelebrationTier } from "@/components/learn/celebration-overlay";
import { useLearnProgress, isMilestone } from "@/hooks/use-learn-progress";
import {
  buildUnits,
  currentUnitId,
  dueEntries,
  masteryByCategory,
  masteryByLevel,
  overallMastery,
  type Unit,
} from "@/lib/learn-progress";
import { DICTIONARY_ENTRIES } from "@/services/translation";
import { LEVEL_META } from "@/types/translation";

const ENTRIES = DICTIONARY_ENTRIES;
const UNITS = buildUnits(ENTRIES);

function dayIndex(length: number) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  return Math.floor((Date.now() - start.getTime()) / 86_400_000) % length;
}

export default function LearnPage() {
  const { state, hydrated, recordAnswer, rateCard, completeUnit, completeIntro } = useLearnProgress();
  const [now] = React.useState(() => Date.now());
  const [activeUnit, setActiveUnit] = React.useState<Unit | null>(null);
  const [celebration, setCelebration] = React.useState<{ tier: CelebrationTier; milestone?: number }>({ tier: "none" });
  const currentRef = React.useRef<HTMLDivElement>(null);

  const daily = ENTRIES[dayIndex(ENTRIES.length)];
  const currentId = currentUnitId(UNITS, state.completedUnits);
  const currentUnit = UNITS.find((u) => u.id === currentId) ?? UNITS[0];
  const overall = overallMastery(ENTRIES, state.srs);
  const due = React.useMemo(() => dueEntries(ENTRIES, state.srs, now), [state.srs, now]);

  const openUnit = (unit: Unit) => setActiveUnit(unit);

  const finishSession = (scorePct: number) => {
    if (!activeUnit) return;
    const next = completeUnit(activeUnit.id, scorePct);
    if (isMilestone(next.streak.count)) setCelebration({ tier: "milestone", milestone: next.streak.count });
    else setCelebration({ tier: scorePct >= 1 ? "perfect" : "modest" });
  };

  const scrollToCurrent = () =>
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        <ScrollProgress />
        <AuroraBackdrop />
        <SiteHeader />

        <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <header className="mb-8 max-w-2xl">
            <h1 className="font-display text-display-md font-bold">
              Learn <span className="gradient-text">Kreol Morisien</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Follow the island trail, practise with games, and let spaced repetition make it stick.
            </p>
          </header>

          <LearnHero
            daily={daily}
            streak={state.streak.count}
            today={state.streak.todayCount}
            goal={state.streak.goal}
            learned={overall.learned}
            mastered={overall.mastered}
            total={overall.total}
            currentLabel={`Unit ${currentId + 1} · ${LEVEL_META[currentUnit.level].label}`}
            onContinue={scrollToCurrent}
          />

          <div className="mt-14">
            <LessonPath
              units={UNITS}
              completed={state.completedUnits}
              currentId={currentId}
              onOpenUnit={openUnit}
              currentRef={currentRef}
            />
          </div>

          <section className="mt-16" aria-label="Review deck">
            <h2 className="mb-4 font-display text-xl font-bold">Review deck</h2>
            <FlashcardDeck
              dueEntries={due}
              onRate={rateCard}
              mastered={overall.mastered}
              total={overall.total}
              onStart={scrollToCurrent}
            />
          </section>

          <div className="mt-16">
            <MasteryDashboard
              byLevel={masteryByLevel(ENTRIES, state.srs)}
              byCategory={masteryByCategory(ENTRIES, state.srs)}
              records={state.records}
            />
          </div>

          <section className="mt-16" aria-label="Dictionary">
            <Link
              href="/dictionary"
              className="group flex items-center justify-between gap-4 rounded-[var(--radius)] border bg-card p-6 shadow-sm transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
            >
              <span className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="size-6" />
                </span>
                <span>
                  <span className="block font-display text-lg font-bold">Explore the full dictionary</span>
                  <span className="block text-sm text-muted-foreground">
                    All {ENTRIES.length} words with meanings, examples &amp; audio.
                  </span>
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </section>
        </main>

        <AnimatePresence>
          {activeUnit && (
            <PracticeSession
              key={activeUnit.id}
              unit={activeUnit}
              allEntries={ENTRIES}
              onAnswer={recordAnswer}
              onComplete={finishSession}
              onClose={() => setActiveUnit(null)}
            />
          )}
        </AnimatePresence>

        <CelebrationOverlay
          tier={celebration.tier}
          milestone={celebration.milestone}
          onDone={() => setCelebration({ tier: "none" })}
        />

        {hydrated && !state.seen && <IntroSheet onDone={completeIntro} />}
      </div>
    </MotionConfig>
  );
}
