"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Copy, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryStyle } from "@/components/learn/category-kit";
import { riseItem } from "@/components/learn/motion";
import { LANGUAGE_META, LEVEL_META, type Language, type Level } from "@/types/translation";
import type { DictionaryCategory } from "@/services/translation";
import { cn } from "@/lib/utils";

export interface DictionaryEntry {
  headword: string;
  language: Language;
  partOfSpeech?: string;
  meaningEn: string;
  meaningFr?: string;
  category: string;
  level?: Level;
  pronunciation?: string;
  examples?: string[];
}

const LEVEL_BADGE: Record<Level, "success" | "info" | "warning"> = {
  beginner: "success",
  intermediate: "info",
  advanced: "warning",
};

export function EntryCard({ entry }: { entry: DictionaryEntry }) {
  const [copied, setCopied] = React.useState(false);
  const cat = categoryStyle(entry.category as DictionaryCategory);
  const Icon = cat.icon;
  const meta = LANGUAGE_META[entry.language];

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(entry.headword);
    u.lang = "fr-FR"; // best-available browser proxy for Kreol
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`${entry.headword} — ${entry.meaningEn}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div variants={riseItem} className="h-full">
      <Card interactive className="group flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", cat.chip)}>
              <Icon className="size-4" />
            </span>
            <div>
              <h3 className="text-lg font-semibold leading-tight">{entry.headword}</h3>
              {entry.pronunciation && <p className="text-xs text-muted-foreground">/{entry.pronunciation}/</p>}
            </div>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{meta.flag}</span>
        </div>

        <p className="mt-3 flex-1">
          {entry.meaningEn}
          {entry.meaningFr && <span className="block text-sm text-muted-foreground">{entry.meaningFr}</span>}
        </p>

        {entry.examples?.[0] && (
          <p className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
            {entry.examples[0]}
            {entry.examples[1] ? ` — ${entry.examples[1]}` : ""}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {entry.level && <Badge variant={LEVEL_BADGE[entry.level]}>{LEVEL_META[entry.level].label}</Badge>}
            <Badge variant="outline">{cat.label}</Badge>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button type="button" onClick={speak} aria-label={`Listen to ${entry.headword}`} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Volume2 className="size-4" />
            </button>
            <button type="button" onClick={copy} aria-label={`Copy ${entry.headword}`} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
