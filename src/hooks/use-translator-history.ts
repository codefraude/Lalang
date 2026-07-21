"use client";

import * as React from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Language, Register } from "@/types/translation";

export interface HistoryItem {
  id: string;
  sourceText: string;
  resultText: string;
  source: Language;
  target: Language;
  register: Register;
  favorite: boolean;
  at: number;
}

const KEY = "lalang.translator.history.v1";
const MAX = 80;

export function useTranslatorHistory() {
  const [items, setItems, hydrated] = useLocalStorage<HistoryItem[]>(KEY, []);

  const add = React.useCallback(
    (entry: Pick<HistoryItem, "sourceText" | "resultText" | "source" | "target" | "register">) => {
      setItems((prev) => {
        const id = `${entry.source}-${entry.target}-${Date.now()}`;
        const deduped = prev.filter((p) => !(p.sourceText === entry.sourceText && p.target === entry.target && !p.favorite));
        return [{ ...entry, id, favorite: false, at: Date.now() }, ...deduped].slice(0, MAX);
      });
    },
    [setItems],
  );

  const toggleFavorite = React.useCallback(
    (id: string) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))),
    [setItems],
  );

  const remove = React.useCallback((id: string) => setItems((prev) => prev.filter((p) => p.id !== id)), [setItems]);
  const clear = React.useCallback(() => setItems((prev) => prev.filter((p) => p.favorite)), [setItems]);

  return { items, hydrated, add, toggleFavorite, remove, clear };
}
