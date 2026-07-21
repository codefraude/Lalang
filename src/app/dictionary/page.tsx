"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { AuroraBackdrop } from "@/components/learn/aurora-backdrop";
import { ScrollProgress } from "@/components/learn/scroll-progress";
import { CountUp } from "@/components/learn/count-up";
import { containerStagger } from "@/components/learn/motion";
import { WordSpotlight } from "@/components/dictionary/word-spotlight";
import { DictToolbar } from "@/components/dictionary/dict-toolbar";
import { EntryCard } from "@/components/dictionary/entry-card";
import { DICTIONARY_ENTRIES } from "@/services/translation";
import { LEVELS } from "@/types/translation";

const ENTRIES = DICTIONARY_ENTRIES;
const PAGE_SIZE = 24;
const LEVEL_RANK: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

const CATEGORY_COUNTS: Record<string, number> = ENTRIES.reduce(
  (acc, e) => ((acc[e.category] = (acc[e.category] ?? 0) + 1), acc),
  { all: ENTRIES.length } as Record<string, number>,
);
const WITH_EXAMPLES = ENTRIES.filter((e) => e.examples?.length).length;

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold">
        <CountUp to={value} />
      </p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

export default function DictionaryPage() {
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [level, setLevel] = React.useState("all");
  const [sort, setSort] = React.useState("az");
  const [page, setPage] = React.useState(1);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ENTRIES.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (level !== "all" && e.level !== level) return false;
      if (!needle) return true;
      return (
        e.headword.toLowerCase().includes(needle) ||
        e.meaningEn.toLowerCase().includes(needle) ||
        (e.meaningFr?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [q, category, level]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    if (sort === "za") arr.sort((a, b) => b.headword.localeCompare(a.headword));
    else if (sort === "level")
      arr.sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || a.headword.localeCompare(b.headword));
    else arr.sort((a, b) => a.headword.localeCompare(b.headword));
    return arr;
  }, [filtered, sort]);

  React.useEffect(() => setPage(1), [q, category, level, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goToPage = (next: number) => {
    setPage(next);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh">
      <ScrollProgress />
      <AuroraBackdrop />
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <header>
            <h1 className="font-display text-display-md font-bold">
              Kreol Morisien <span className="gradient-text">dictionary</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              The meaning behind the words — search, listen, and discover the language of Mauritius.
            </p>
            <div className="mt-6 flex gap-8">
              <Stat value={ENTRIES.length} label="words" />
              <Stat value={CATEGORY_COUNTS.all ? Object.keys(CATEGORY_COUNTS).length - 1 : 0} label="categories" />
              <Stat value={WITH_EXAMPLES} label="with examples" />
            </div>
          </header>
          <WordSpotlight entries={ENTRIES} />
        </div>

        <div className="mt-10">
          <DictToolbar
            q={q}
            setQ={setQ}
            category={category}
            setCategory={setCategory}
            categoryCounts={CATEGORY_COUNTS}
            level={level}
            setLevel={setLevel}
            sort={sort}
            setSort={setSort}
            resultCount={sorted.length}
          />
        </div>

        <div ref={resultsRef} className="mt-6 scroll-mt-20">
          {sorted.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <BookOpen className="size-6" />
                </span>
                <p className="font-medium">No words found</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Try another spelling or clear the filters — Kreol has many spelling variants.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <motion.div
                key={`${page}-${category}-${level}-${sort}-${q}`}
                variants={containerStagger}
                initial="hidden"
                animate="show"
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {paged.map((e) => (
                  <EntryCard key={`${e.headword}-${e.meaningEn}`} entry={e} />
                ))}
              </motion.div>
              <Pagination page={page} pageCount={pageCount} onPageChange={goToPage} className="mt-8" />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
