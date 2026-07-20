"use client";

import * as React from "react";
import type {
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

export function useTranslate() {
  const [state, setState] = React.useState<State>({
    result: null,
    loading: false,
    error: null,
  });

  const translate = React.useCallback(async (args: TranslateArgs) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ result: null, loading: false, error: data.error ?? "Translation failed." });
        return;
      }
      setState({ result: data as TranslationResult, loading: false, error: null });
    } catch {
      setState({ result: null, loading: false, error: "Network error. Try again." });
    }
  }, []);

  return { ...state, translate };
}
