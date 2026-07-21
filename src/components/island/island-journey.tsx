"use client";

import { OceanScene } from "@/components/island/scenes/ocean-scene";
import { VillageScene } from "@/components/island/scenes/village-scene";
import { SegaScene } from "@/components/island/scenes/sega-scene";
import { TempleScene } from "@/components/island/scenes/temple-scene";

/** The scroll journey after the hero: ocean → village → sega → AI temple. */
export function IslandJourney() {
  return (
    <div className="bg-[#020617]">
      <OceanScene />
      <VillageScene />
      <SegaScene />
      <TempleScene />
    </div>
  );
}
