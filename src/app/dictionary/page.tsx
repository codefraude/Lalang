"use client";

import * as React from "react";
import { Search, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { EntryCard, type DictionaryEntry } from "@/components/dictionary/entry-card";
import { LEVELS, LEVEL_META, type Level } from "@/types/translation";

const CATEGORIES = [
  "all",
  "food",
  "family",
  "greetings",
  "expressions",
  "slang",
  "traditional",
  "general",
] as const;

const LEVEL_FILTERS = ["all", ...LEVELS] as const;
const PAGE_SIZE = 12;

export default function DictionaryPage() {
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("all");
  const [level, setLevel] = React.useState<(typeof LEVEL_FILTERS)[number]>("all");
  const [entries, setEntries] = React.useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const visible = React.useMemo(
    () => (level === "all" ? entries : entries.filter((e) => e.level === level)),
    [entries, level],
  );

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const paged = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstShown = visible.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, visible.length);

  const load = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/dictionary?${params}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }, [q, category]);

  React.useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  // Any filter change collapses back to the first page.
  React.useEffect(() => setPage(1), [q, category, level]);

  const goToPage = (next: number) => {
    setPage(next);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="font-display text-display-md font-bold">Cultural dictionary</h1>
        <p className="mt-2 text-muted-foreground">
          The meaning behind the words — not just the translation.
        </p>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a word or meaning…"
            className="h-12 pl-10 text-base"
            aria-label="Search the dictionary"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(c)}
              className="capitalize"
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {LEVEL_FILTERS.map((l) => (
            <Button
              key={l}
              size="sm"
              variant={level === l ? "secondary" : "ghost"}
              onClick={() => setLevel(l)}
            >
              {l === "all" ? "All levels" : LEVEL_META[l].label}
            </Button>
          ))}
        </div>

        {!loading && visible.length > 0 && (
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            Showing <span className="font-medium text-foreground">{firstShown}–{lastShown}</span> of{" "}
            {visible.length} {visible.length === 1 ? "word" : "words"}
          </p>
        )}

        <div ref={resultsRef} className="mt-3 scroll-mt-20">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <BookOpen className="size-6" />
                </span>
                <p className="font-medium">No entries found</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Try another word or level — or suggest a new one through the community flow.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {paged.map((e) => (
                  <EntryCard key={`${e.headword}-${e.language}`} entry={e} />
                ))}
              </div>
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={goToPage}
                className="mt-8"
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
