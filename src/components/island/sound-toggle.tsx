"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAmbientSound } from "@/hooks/use-ambient-sound";

/** Floating mute/unmute for the procedural island ambience (starts muted). */
export function SoundToggle() {
  const { on, toggle } = useAmbientSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Mute island ambience" : "Play island ambience"}
      aria-pressed={on}
      className="fixed bottom-[5.5rem] right-4 z-40 grid size-11 place-items-center rounded-full border bg-card/90 text-foreground shadow-lg backdrop-blur transition-colors hover:bg-card"
    >
      {on ? <Volume2 className="size-5 text-primary" /> : <VolumeX className="size-5" />}
    </button>
  );
}
