"use client";

import { JourneyScene } from "@/components/island/journey-scene";
import { VoicesCard } from "@/components/island/scenes/voices-card";

const ORIGINS = ["African", "Malagasy", "Indian", "Chinese", "French", "British"];

export function OceanScene() {
  return (
    <JourneyScene
      id="journey"
      layout="split-left"
      eyebrow="The Ocean"
      title={
        <>
          Every island has a voice.
          <br /> Ours has <span className="text-[#00D4FF]">millions</span>.
        </>
      }
      background={<div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(90% 70% at 20% 30%, rgba(0,120,180,0.34), transparent 60%)" }} />}
      media={<VoicesCard />}
    >
      <p className="max-w-xl text-white/75">
        Five centuries ago no one lived here — only forest, reef, and the dodo. Then ships came, and with them people
        from every shore of the Indian Ocean.
      </p>
      <p className="mt-3 max-w-xl text-white/60">
        Out of their meeting a new language was born: <span className="text-white">Kreol Morisien</span> — French in its
        words, African in its rhythm, and wholly Mauritian.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {ORIGINS.map((o) => (
          <span key={o} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-[#bfefff]">
            {o}
          </span>
        ))}
      </div>
    </JourneyScene>
  );
}
