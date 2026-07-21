"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bot, Copy, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alternative {
  text: string;
  note: string;
}

export interface AssistantMessage {
  id: string;
  label: string;
  text?: string;
  alternatives?: Alternative[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  messages: AssistantMessage[];
  onAsk: (question: string) => void;
  onUseAlternative: (text: string) => void;
}

/** Collapsible AI tutor panel — renders explain / alternatives / grammar / chat. */
export function AssistantPanel({ open, onClose, loading, messages, onAsk, onUseAlternative }: Props) {
  const [q, setQ] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  if (!open) return null;

  const send = () => {
    const value = q.trim();
    if (!value) return;
    onAsk(value);
    setQ("");
  };

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Language assistant"
      className="flex max-h-[560px] w-full flex-col overflow-hidden rounded-[var(--radius)] border bg-card shadow-md lg:max-h-none lg:w-80 lg:shrink-0"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="inline-flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
            <Bot className="size-4" />
          </span>
          Assistant
        </span>
        <button type="button" onClick={onClose} aria-label="Close assistant" className="rounded-full p-1 text-muted-foreground hover:bg-muted">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            Ask me to explain the translation, suggest alternatives, break down the grammar — or anything about English, French and Kreol.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{m.label}</p>
            {m.text && <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>}
            {m.alternatives && (
              <ul className="space-y-2">
                {m.alternatives.map((a, i) => (
                  <li key={i} className="rounded-lg border bg-muted/40 p-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{a.text}</p>
                      <button type="button" onClick={() => onUseAlternative(a.text)} aria-label="Copy this alternative" className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted">
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                    {a.note && <p className="mt-0.5 text-xs text-muted-foreground">{a.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {loading && (
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="size-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </span>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a question…"
          aria-label="Ask the assistant"
          className="h-9 flex-1 rounded-[calc(var(--radius)-0.35rem)] border border-input bg-background px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
        />
        <button type="button" onClick={send} aria-label="Send" className={cn("grid size-9 shrink-0 place-items-center rounded-[calc(var(--radius)-0.35rem)] bg-primary text-primary-foreground transition-opacity", !q.trim() && "opacity-50")}>
          <Send className="size-4" />
        </button>
      </div>
    </motion.aside>
  );
}
