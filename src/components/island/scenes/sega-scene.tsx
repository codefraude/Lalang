"use client";

import { JourneyScene } from "@/components/island/journey-scene";
import { SegaVisualizer } from "@/components/island/sega-visualizer";

const INSTRUMENTS = ["ravann — goatskin drum", "maravann — seed rattle", "triyang — triangle"];

export function SegaScene() {
  return (
    <JourneyScene
      layout="split-left"
      eyebrow="Sega"
      title={
        <>
          Feel the <span className="text-[#FF8C42]">rhythm</span> of the words.
        </>
      }
      background={<div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 75% 70%, rgba(255,140,66,0.22), transparent 62%)" }} />}
      media={
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-xl">
          <SegaVisualizer />
        </div>
      }
    >
      <p className="max-w-md text-white/75">
        Sega Tipik is the heartbeat of Mauritius — born on the plantations among enslaved Africans and Malagasy, sung in
        Kreol, and danced barefoot on the sand. In 2014 UNESCO recognised it as intangible cultural heritage of humanity.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#FF8C42]/15 px-3 py-1 text-xs font-semibold text-[#ffb37a]">UNESCO heritage · 2014</span>
        {INSTRUMENTS.map((i) => (
          <span key={i} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            {i}
          </span>
        ))}
      </div>
    </JourneyScene>
  );
}
