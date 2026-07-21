"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, Search, Star, Trash2, X } from "lucide-react";
import { LANGUAGE_META } from "@/types/translation";
import type { HistoryItem } from "@/hooks/use-translator-history";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

/** Slide-in history: search, restore, favorite, delete. Persists in localStorage. */
export function HistoryDrawer({ open, onClose, items, onRestore, onToggleFavorite, onRemove, onClear }: Props) {
  const [q, setQ] = React.useState("");
  if (!open) return null;

  const needle = q.trim().toLowerCase();
  const filtered = items.filter((i) => !needle || i.sourceText.toLowerCase().includes(needle) || i.resultText.toLowerCase().includes(needle));
  const sorted = [...filtered].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.at - a.at);

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div className="absolute inset-0 bg-background/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="relative z-10 flex h-full w-full max-w-sm flex-col border-r bg-card shadow-xl"
        aria-label="Translation history"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Clock className="size-4 text-primary" /> History
          </span>
          <button type="button" onClick={onClose} aria-label="Close history" className="rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history…" aria-label="Search history" className="h-9 w-full rounded-[calc(var(--radius)-0.35rem)] border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {sorted.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">{items.length ? "No matches." : "Your translations will appear here."}</p>
          ) : (
            <ul className="space-y-2">
              {sorted.map((item) => (
                <li key={item.id} className="group rounded-[var(--radius)] border p-3 transition-colors hover:border-primary/40">
                  <button type="button" onClick={() => onRestore(item)} className="block w-full text-left">
                    <span className="text-xs text-muted-foreground">
                      {LANGUAGE_META[item.source].flag} → {LANGUAGE_META[item.target].flag}
                    </span>
                    <p className="truncate text-sm text-muted-foreground">{item.sourceText}</p>
                    <p className="truncate text-sm font-medium">{item.resultText}</p>
                  </button>
                  <div className="mt-1.5 flex items-center gap-1">
                    <button type="button" onClick={() => onToggleFavorite(item.id)} aria-label="Favorite" className={cn("rounded p-1 text-muted-foreground hover:bg-muted", item.favorite && "text-accent")}>
                      <Star className={cn("size-3.5", item.favorite && "fill-current")} />
                    </button>
                    <button type="button" onClick={() => onRemove(item.id)} aria-label="Delete" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.some((i) => !i.favorite) && (
          <div className="border-t p-3">
            <button type="button" onClick={onClear} className="w-full rounded-[calc(var(--radius)-0.35rem)] border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive">
              Clear recent (keep favorites)
            </button>
          </div>
        )}
      </motion.aside>
    </div>
  );
}
