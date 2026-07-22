"use client";

import * as React from "react";
import type {
  DetectionResult,
  Language,
  Register,
  SourceSelection,
  TranslationResult,
} from "@/types/translation";

interface TranslateArgs {
  text: string;
  source: SourceSelection;
  target: Language;
  register?: Register;
}

interface State {
  result: TranslationResult | null;
  loading: boolean;
  error: string | null;
}

type StreamEvent =
  | { type: "start"; sourceText: string; source: Language; target: Language; register: Register; detection: DetectionResult }
  | { type: "chunk"; text: string }
  | { type: "done"; engine: TranslationResult["engine"]; culturalNote?: string; resultText: string }
  | { type: "error"; error: string };

export function useTranslate() {
  const [state, setState] = React.useState<State>({
    result: null,
    loading: false,
    error: null,
  });
  const requestRef = React.useRef(0);

  const translate = React.useCallback(async (args: TranslateArgs) => {
    const token = ++requestRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch("/api/translate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        if (token === requestRef.current) {
          setState({ result: null, loading: false, error: data.error ?? "Translation failed." });
        }
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let base: TranslationResult | null = null;

      const handle = (evt: StreamEvent) => {
        if (token !== requestRef.current) return;
        if (evt.type === "start") {
          base = {
            sourceText: evt.sourceText,
            resultText: "",
            source: evt.source,
            target: evt.target,
            register: evt.register,
            engine: "ai",
            detection: evt.detection,
            trace: [],
            streaming: true,
          };
          acc = "";
          setState({ result: base, loading: false, error: null });
        } else if (evt.type === "chunk" && base) {
          acc += evt.text;
          const b = base;
          setState((s) => ({ ...s, result: { ...b, resultText: acc, streaming: true } }));
        } else if (evt.type === "done" && base) {
          const b = base;
          setState({
            result: {
              ...b,
              resultText: evt.resultText || acc,
              engine: evt.engine,
              culturalNote: evt.culturalNote,
              streaming: false,
            },
            loading: false,
            error: null,
          });
        } else if (evt.type === "error") {
          setState({ result: null, loading: false, error: evt.error ?? "Translation failed." });
        }
      };

      const drainLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        try {
          handle(JSON.parse(trimmed) as StreamEvent);
        } catch {
          // Ignore malformed frames.
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) drainLine(line);
      }
      drainLine(buffer);
    } catch {
      if (token === requestRef.current) {
        setState({ result: null, loading: false, error: "Network error. Try again." });
      }
    }
  }, []);

  return { ...state, translate };
}
