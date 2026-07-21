"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Heart, Mic, Sparkles } from "lucide-react";
import { JourneyScene } from "@/components/island/journey-scene";
import { TranslatePreview } from "@/components/island/scenes/translate-preview";

const STEPS = [
  { icon: Mic, label: "You speak — in English, French or Creole" },
  { icon: Heart, label: "The AI reads the emotion and intent" },
  { icon: Globe, label: "It weighs the cultural context" },
  { icon: Sparkles, label: "Natural Kreol Morisien, as it's really said" },
];

const FEATURES = ["7 tone modes", "Cultural notes", "Pronunciation", "A built-in tutor"];

export function TempleScene() {
  return (
    <JourneyScene
      layout="split-left"
      eyebrow="The AI Temple"
      title="Speak, and be understood."
      background={<div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(90% 70% at 25% 45%, rgba(85,110,255,0.2), transparent 60%)" }} />}
      media={<TranslatePreview />}
    >
      <p className="max-w-md text-white/70">
        Lalang doesn&apos;t translate word-for-word. It listens for tone, intent and culture — then answers the way a
        Mauritian actually would.
      </p>
      <ol className="mt-6 space-y-2.5">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-3 backdrop-blur"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#00D4FF]/15 text-[#7ff0ff]">
                <Icon className="size-4" />
              </span>
              <span className="text-sm text-white/85">{step.label}</span>
            </motion.li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap gap-2">
        {FEATURES.map((f) => (
          <span key={f} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
            {f}
          </span>
        ))}
      </div>
      <Link
        href="/translator"
        className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#02121f] shadow-lg transition-transform hover:scale-[1.03]"
        style={{ background: "linear-gradient(100deg,#00D4FF,#00A86B)" }}
      >
        Enter the temple <ArrowRight className="size-4" />
      </Link>
    </JourneyScene>
  );
}
