"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { categoryStyle } from "@/components/learn/category-kit";
import { SPRING_SNAPPY } from "@/components/learn/motion";
import { cn } from "@/lib/utils";
import type { Unit, UnitStatus } from "@/lib/learn-progress";

/** A single stop on the journey: a circular unit bubble with a label beneath. */
export function PathNode({
  unit,
  status,
  onOpen,
}: {
  unit: Unit;
  status: UnitStatus;
  onOpen: () => void;
}) {
  const reduce = useReducedMotion();
  const cat = categoryStyle(unit.category);
  const locked = status === "locked";
  const Icon = status === "complete" ? Check : locked ? Lock : cat.icon;

  return (
    <div className="flex w-24 flex-col items-center gap-2 text-center">
      <div className="relative">
        {status === "current" && !reduce && (
          <motion.span
            aria-hidden
            className="absolute -inset-1 rounded-full bg-primary/25"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <motion.button
          type="button"
          onClick={locked ? undefined : onOpen}
          disabled={locked}
          aria-disabled={locked}
          aria-label={`Unit ${unit.id + 1}, ${cat.label} — ${status}`}
          whileHover={locked ? undefined : { scale: 1.06 }}
          whileTap={locked ? undefined : { scale: 0.92 }}
          transition={SPRING_SNAPPY}
          className={cn(
            "relative grid size-16 place-items-center rounded-full border-2 shadow-md transition-colors",
            status === "complete" && "border-transparent bg-gradient-to-br from-primary to-accent text-white",
            status === "current" && "border-primary bg-card text-primary ring-4 ring-primary/20",
            locked && "cursor-not-allowed border-border bg-muted text-muted-foreground/40",
          )}
        >
          <Icon className="size-6" />
        </motion.button>
      </div>
      <div>
        <p className={cn("text-xs font-semibold leading-tight", locked && "text-muted-foreground")}>{cat.label}</p>
        <p className="text-[11px] text-muted-foreground">{unit.entries.length} words</p>
      </div>
    </div>
  );
}
