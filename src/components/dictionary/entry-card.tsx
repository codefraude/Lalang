import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_META, LEVEL_META, type Language, type Level } from "@/types/translation";

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
  return (
    <Card interactive>
      <CardContent className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold">{entry.headword}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {LANGUAGE_META[entry.language].flag} {LANGUAGE_META[entry.language].nativeLabel}
          </span>
        </div>
        {entry.pronunciation && (
          <p className="text-sm text-muted-foreground">/{entry.pronunciation}/</p>
        )}
        <p className="mt-2">{entry.meaningEn}</p>
        {entry.examples?.[0] && (
          <p className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
            {entry.examples[0]}
            {entry.examples[1] ? ` — ${entry.examples[1]}` : ""}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {entry.level && (
            <Badge variant={LEVEL_BADGE[entry.level]}>{LEVEL_META[entry.level].label}</Badge>
          )}
          <Badge variant="outline" className="capitalize">
            {entry.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
