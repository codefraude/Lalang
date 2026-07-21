"use client";

import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { LANGUAGES, LANGUAGE_META, type Language, type SourceSelection } from "@/types/translation";

const LANG_OPTIONS = LANGUAGES.map((c) => ({ value: c, label: `${LANGUAGE_META[c].flag} ${LANGUAGE_META[c].nativeLabel}` }));
const SOURCE_OPTIONS = [{ value: "auto", label: "🌐 Detect language" }, ...LANG_OPTIONS];

interface Props {
  source: SourceSelection;
  target: Language;
  onSource: (v: SourceSelection) => void;
  onTarget: (v: Language) => void;
  onSwap: () => void;
}

export function LangBar({ source, target, onSource, onTarget, onSwap }: Props) {
  return (
    <div className="flex items-center gap-2">
      <SelectMenu value={source} options={SOURCE_OPTIONS} onChange={(v) => onSource(v as SourceSelection)} ariaLabel="Source language" className="flex-1" />
      <Button variant="ghost" size="icon" aria-label="Swap languages" onClick={onSwap} disabled={source === "auto"} className="shrink-0">
        <ArrowLeftRight />
      </Button>
      <SelectMenu value={target} options={LANG_OPTIONS} onChange={(v) => onTarget(v as Language)} ariaLabel="Target language" className="flex-1" />
    </div>
  );
}
