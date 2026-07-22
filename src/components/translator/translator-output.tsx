"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Languages, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGE_META, type TranslationResult } from "@/types/translation";
import { useI18n } from "@/i18n/provider";

const EXAMPLES = ["Bonzour, ki manier?", "I'm very tired today", "On se voit demain", "Mo kontan twa"];

interface Props {
  result: TranslationResult | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onExample: (text: string) => void;
  actions?: React.ReactNode;
}

/** Result card: thinking state, error, first-run examples, or the translation. */
export function TranslatorOutput({ result, loading, error, onRetry, onExample, actions }: Props) {
  const { t } = useI18n();
  return (
    <div className="relative flex h-full min-h-[240px] flex-col rounded-[var(--radius)] border bg-muted/30 shadow-sm">
      <div className="flex flex-1 flex-col p-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 flex-col justify-center gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="size-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </span>
                {t("translator.translating")}
              </span>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="h-3 rounded bg-muted" initial={{ opacity: 0.4 }} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }} style={{ width: `${90 - i * 18}%` }} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <span className="grid size-11 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </span>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCcw className="size-4" /> Try again
              </Button>
            </motion.div>
          ) : result ? (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  <Languages className="size-3" /> {LANGUAGE_META[result.source].nativeLabel} → {LANGUAGE_META[result.target].nativeLabel}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                  {Math.round(result.detection.confidence * 100)}% confident
                </span>
                <span className="rounded-full px-2 py-0.5 text-muted-foreground">
                  {result.engine === "ai" ? "✨ AI" : "📖 Dictionary"}
                </span>
              </div>
              <p className="flex-1 whitespace-pre-wrap text-lg leading-relaxed">
                {result.resultText}
                {result.streaming && (
                  <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse bg-primary" aria-hidden />
                )}
              </p>
              {result.culturalNote && !result.streaming && (
                <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-sm text-muted-foreground">💡 {result.culturalNote}</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">{t("translator.empty")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button" onClick={() => onExample(ex)} className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                    {ex}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {result && !loading && !result.streaming && actions}
    </div>
  );
}
