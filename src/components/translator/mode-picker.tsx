"use client";

import { motion } from "framer-motion";
import { REGISTERS, REGISTER_META, type Register } from "@/types/translation";
import { cn } from "@/lib/utils";

const EMOJI: Record<Register, string> = {
  casual: "💬",
  business: "🏢",
  school: "🎓",
  tourism: "🏝️",
  social: "📱",
  formal: "✉️",
  slang: "🔥",
};

/** Translation "modes" as selectable pill-cards — drives the AI's target tone. */
export function ModePicker({ value, onChange }: { value: Register; onChange: (r: Register) => void }) {
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Translation mode">
        {REGISTERS.map((r) => {
          const active = value === r;
          return (
            <motion.button
              key={r}
              type="button"
              role="radio"
              aria-checked={active}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(r)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                active ? "border-transparent bg-primary text-primary-foreground shadow-sm" : "hover:border-primary/40",
              )}
            >
              <span aria-hidden>{EMOJI[r]}</span>
              <span className="font-medium">{REGISTER_META[r].label}</span>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{REGISTER_META[value].hint}</p>
    </div>
  );
}
