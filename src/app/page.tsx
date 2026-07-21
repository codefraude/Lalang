"use client";

import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { ArrowRight, BookMarked, GraduationCap, Mic } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { JourneyHero } from "@/components/island/journey/journey-hero";
import { IslandJourney } from "@/components/island/island-journey";
import { IslandMap } from "@/components/island/island-map";
import { MauritiusInfo } from "@/components/island/mauritius-info";
import { LalaOrb } from "@/components/island/lala-orb";
import { SoundToggle } from "@/components/island/sound-toggle";

const PORTALS = [
  { href: "/translator", icon: Mic, title: "Speak", body: "Translate and talk in natural Kreol Morisien with an AI tutor." },
  { href: "/dictionary", icon: BookMarked, title: "Discover", body: "1,396 words with meanings, examples, pronunciation and audio." },
  { href: "/learn", icon: GraduationCap, title: "Learn", body: "A gamified island journey — quests, streaks and mastery." },
];

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        <SiteHeader />
        <JourneyHero />
        <IslandJourney />
        <IslandMap />

        {/* Smooth bridge out of the dark journey into the light app section. */}
        <div aria-hidden className="h-28 bg-gradient-to-b from-[#020617] to-background" />

        <MauritiusInfo />

        <section className="bg-background px-4 pb-20 pt-4">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="font-display text-display-md font-bold">
              Continue the <span className="gradient-text">journey</span>
            </h2>
            <p className="mt-2 text-muted-foreground">Three doors into the island.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {PORTALS.map((portal) => {
                const Icon = portal.icon;
                return (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    className="group rounded-[var(--radius)] border bg-card p-6 text-left shadow-sm transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                  >
                    <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 flex items-center gap-1.5 font-display text-lg font-bold">
                      {portal.title}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{portal.body}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold text-foreground">Lalang</span> — made for Mauritius 🇲🇺
            </p>
            <nav className="flex gap-4">
              <Link href="/translator" className="transition-colors hover:text-foreground">Translate</Link>
              <Link href="/dictionary" className="transition-colors hover:text-foreground">Dictionary</Link>
              <Link href="/learn" className="transition-colors hover:text-foreground">Learn</Link>
            </nav>
          </div>
        </footer>

        <LalaOrb />
        <SoundToggle />
      </div>
    </MotionConfig>
  );
}
