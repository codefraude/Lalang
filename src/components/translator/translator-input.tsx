"use client";

import * as React from "react";
import { Mic, X } from "lucide-react";
import { ProgressRing } from "@/components/learn/progress-ring";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { cn } from "@/lib/utils";

function readingTime(words: number): string {
  if (!words) return "";
  const secs = Math.round((words / 200) * 60);
  return secs < 60 ? `~${Math.max(1, secs)}s read` : `~${Math.round(secs / 60)} min read`;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  sourceLang: string;
  max: number;
  onSubmit?: () => void;
}

/** Source card: auto-growing textarea + live counters, dictation, drop & paste. */
export function TranslatorInput({ value, onChange, sourceLang, max, onSubmit }: Props) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const voiceLang = sourceLang === "auto" ? "en" : sourceLang;
  const { listening, supported, toggle } = useVoiceInput(voiceLang, (t) => onChange(value ? `${value} ${t}` : t));

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 440)}px`;
  }, [value]);

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const near = value.length > max * 0.9;

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("text")) onChange((await file.text()).slice(0, max));
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="relative flex h-full flex-col rounded-[var(--radius)] border bg-card shadow-sm transition-colors focus-within:border-primary/40"
    >
      <textarea
        ref={ref}
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder="Type, paste, or speak…"
        aria-label="Text to translate"
        className="min-h-[160px] w-full flex-1 resize-none bg-transparent p-4 text-lg leading-relaxed outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ProgressRing value={value.length / max} size={22} stroke={3} barClassName={near ? "stroke-destructive" : "stroke-primary"} />
            <span className={cn(near && "text-destructive")}>
              {value.length}/{max}
            </span>
          </span>
          {words > 0 && (
            <span className="hidden sm:inline">
              {words} words · {readingTime(words)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <button type="button" onClick={() => onChange("")} aria-label="Clear text" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
              <X className="size-4" />
            </button>
          )}
          {supported && (
            <button
              type="button"
              onClick={toggle}
              aria-pressed={listening}
              aria-label={listening ? "Stop dictation" : "Dictate with your voice"}
              className={cn(
                "rounded-full p-1.5 transition-colors",
                listening ? "animate-pulse bg-destructive/10 text-destructive" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Mic className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
