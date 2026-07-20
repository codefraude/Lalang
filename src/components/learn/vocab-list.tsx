import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LANGUAGE_META } from "@/types/translation";
import type { SeedDictionaryEntry } from "@/services/translation";

interface VocabListProps {
  entries: SeedDictionaryEntry[];
}

export function VocabList({ entries }: VocabListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No words at this level yet.</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <Card key={`${entry.headword}-${entry.language}`} interactive>
          <CardContent className="p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{entry.headword}</h3>
              <span className="shrink-0 text-xs text-muted-foreground">
                {LANGUAGE_META[entry.language].flag} {LANGUAGE_META[entry.language].nativeLabel}
              </span>
            </div>
            {entry.pronunciation && (
              <p className="text-xs text-muted-foreground">/{entry.pronunciation}/</p>
            )}
            <p className="mt-1 text-sm">{entry.meaningEn}</p>
            {entry.examples?.[0] && (
              <p className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
                {entry.examples[0]}
                {entry.examples[1] ? ` — ${entry.examples[1]}` : ""}
              </p>
            )}
            <Badge variant="outline" className="mt-3 capitalize">
              {entry.category}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
