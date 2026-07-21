"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { scorePassword } from "@/lib/password-strength";
import { cn } from "@/lib/utils";

const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-info",
  "bg-success",
] as const;

const REQUIREMENTS: { key: keyof ReturnType<typeof scorePassword>["checks"]; label: string }[] = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase", label: "An uppercase letter" },
  { key: "number", label: "A number" },
  { key: "symbol", label: "A symbol" },
];

/** Live strength meter + requirements checklist. */
export function PasswordStrength({ password }: { password: string }) {
  const { score, label, percent, checks } = scorePassword(password);
  if (!password) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn("h-full rounded-full", BAR_COLORS[score])}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="w-16 text-right text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <ul className="grid grid-cols-2 gap-1.5">
        {REQUIREMENTS.map((r) => {
          const ok = checks[r.key];
          return (
            <li
              key={r.key}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                ok ? "text-success" : "text-muted-foreground",
              )}
            >
              {ok ? <Check className="size-3.5" /> : <X className="size-3.5 opacity-50" />}
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
