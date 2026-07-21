"use client";

import { Check, Copy, Gauge, Lightbulb, ListTree, RefreshCw, Shuffle, Star, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Register } from "@/types/translation";

type AssistantTask = "explain" | "alternatives" | "grammar";

interface Props {
  isFavorite: boolean;
  copied: boolean;
  speaking: boolean;
  busy?: boolean;
  onCopy: () => void;
  onSpeak: (rate: number) => void;
  onFavorite: () => void;
  onAgain: () => void;
  onRewrite: (register: Register) => void;
  onAssistant: (task: AssistantTask) => void;
}

const TONES: { label: string; register: Register }[] = [
  { label: "Simpler", register: "school" },
  { label: "Formal", register: "formal" },
  { label: "Casual", register: "casual" },
];

function IconBtn({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn("rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", active && "text-primary")}
    >
      {children}
    </button>
  );
}

/** The action bar under a result: utilities + real AI actions. */
export function ResultActions({ isFavorite, copied, speaking, busy, onCopy, onSpeak, onFavorite, onAgain, onRewrite, onAssistant }: Props) {
  const chip = "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/40 disabled:opacity-50";
  return (
    <div className="space-y-2 border-t px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <IconBtn label="Copy translation" active={copied} onClick={onCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </IconBtn>
          <IconBtn label="Read aloud" active={speaking} onClick={() => onSpeak(1)}>
            <Volume2 className="size-4" />
          </IconBtn>
          <IconBtn label="Read slowly" onClick={() => onSpeak(0.6)}>
            <Gauge className="size-4" />
          </IconBtn>
          <IconBtn label={isFavorite ? "Remove favorite" : "Save to favorites"} active={isFavorite} onClick={onFavorite}>
            <Star className={cn("size-4", isFavorite && "fill-current")} />
          </IconBtn>
        </div>
        <IconBtn label="Translate again" onClick={onAgain}>
          <RefreshCw className="size-4" />
        </IconBtn>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={busy} onClick={() => onAssistant("explain")} className={chip}>
          <Lightbulb className="size-3.5 text-accent" /> Explain
        </button>
        <button type="button" disabled={busy} onClick={() => onAssistant("alternatives")} className={chip}>
          <Shuffle className="size-3.5 text-accent" /> Alternatives
        </button>
        <button type="button" disabled={busy} onClick={() => onAssistant("grammar")} className={chip}>
          <ListTree className="size-3.5 text-accent" /> Grammar
        </button>
        <span className="mx-0.5 w-px self-stretch bg-border" aria-hidden />
        {TONES.map((t) => (
          <button key={t.label} type="button" disabled={busy} onClick={() => onRewrite(t.register)} className={chip}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
