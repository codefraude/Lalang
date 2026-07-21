"use client";

import { LayoutGrid, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { categoryStyle } from "@/components/learn/category-kit";
import { LEVELS, LEVEL_META } from "@/types/translation";
import type { DictionaryCategory } from "@/services/translation";
import { cn } from "@/lib/utils";

const CATS: (DictionaryCategory | "all")[] = [
  "all",
  "greetings",
  "family",
  "food",
  "general",
  "expressions",
  "slang",
  "traditional",
];

const SORTS = [
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "level", label: "By level" },
];

interface Props {
  q: string;
  setQ: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  categoryCounts: Record<string, number>;
  level: string;
  setLevel: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  resultCount: number;
}

export function DictToolbar({ q, setQ, category, setCategory, categoryCounts, level, setLevel, sort, setSort, resultCount }: Props) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a Kreol word or its meaning…"
          className="h-12 pl-10 text-base"
          aria-label="Search the dictionary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => {
          const isAll = c === "all";
          const style = isAll ? null : categoryStyle(c as DictionaryCategory);
          const Icon = isAll ? LayoutGrid : style!.icon;
          const active = category === c;
          const count = categoryCounts[c] ?? 0;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "border-transparent bg-primary text-primary-foreground shadow-sm" : "hover:border-primary/40",
              )}
            >
              <Icon className={cn("size-3.5", !active && !isAll && style!.tint)} />
              {isAll ? "All" : style!.label}
              <span className={cn("text-xs", active ? "text-primary-foreground/70" : "text-muted-foreground")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", ...LEVELS].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                level === l ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {l === "all" ? "All levels" : LEVEL_META[l as (typeof LEVELS)[number]].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {resultCount} {resultCount === 1 ? "word" : "words"}
          </span>
          <SelectMenu value={sort} options={SORTS} onChange={setSort} ariaLabel="Sort words" className="w-32" />
        </div>
      </div>
    </div>
  );
}
