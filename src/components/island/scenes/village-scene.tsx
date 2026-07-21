"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JourneyScene } from "@/components/island/journey-scene";
import { WordArtifact } from "@/components/island/word-artifact";
import { VILLAGE_WORDS } from "@/components/island/island-data";

export function VillageScene() {
  return (
    <JourneyScene
      layout="split-right"
      eyebrow="The Village"
      title="The words of every day"
      background={<div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 80% 40%, rgba(0,168,107,0.2), transparent 62%)" }} />}
      media={
        <div className="grid grid-cols-2 gap-3">
          {VILLAGE_WORDS.map((item) => (
            <WordArtifact key={item.word} item={item} />
          ))}
        </div>
      }
    >
      <p className="max-w-md text-white/70">
        The everyday Kreol you&apos;ll hear in any yard, market or bus. Tap a word to reveal its meaning and a real
        example.
      </p>
      <Link href="/dictionary" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7ff0ff] transition-colors hover:text-white">
        Explore all 1,396 words <ArrowRight className="size-4" />
      </Link>
    </JourneyScene>
  );
}
