"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { useSpeak } from "@/hooks/use-speak";
import { cn } from "@/lib/utils";

/**
 * Small "listen" button around the shared speech hook. Stops click/keyboard
 * events from bubbling by default so it can sit safely inside flip cards and
 * other interactive containers without triggering them.
 */
export function SpeakButton({
  text,
  lang,
  label,
  className,
  stopPropagation = true,
}: {
  text: string;
  lang: string;
  label?: string;
  className?: string;
  stopPropagation?: boolean;
}) {
  const { speak, speaking } = useSpeak();

  return (
    <button
      type="button"
      aria-label={label ?? `Listen to ${text}`}
      aria-pressed={speaking}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        speak(text, lang);
      }}
      onKeyDown={(e) => {
        if (stopPropagation && (e.key === "Enter" || e.key === " ")) e.stopPropagation();
      }}
      className={cn(
        "inline-grid place-items-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Volume2 className="size-4" />
    </button>
  );
}
