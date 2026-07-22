"use client";

import * as React from "react";
import { DEFAULT_LOCALE, LOCALES, STORAGE_KEY, type Locale } from "./config";
import { MESSAGES } from "./messages";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

/**
 * Client-side interface localisation. Locale is persisted to localStorage and
 * defaults to English (or French when the browser prefers it). To avoid a
 * hydration mismatch, the server and first client render both use the default;
 * the stored locale is applied after mount.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && (LOCALES as readonly string[]).includes(stored)) {
        setLocaleState(stored);
      } else if (navigator.language?.slice(0, 2).toLowerCase() === "fr") {
        setLocaleState("fr");
      }
    } catch {
      // localStorage unavailable — keep the default.
    }
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // Ignore persistence failures.
    }
  }, []);

  const t = React.useCallback<Translate>(
    (key, vars) => {
      const dict = MESSAGES[locale] ?? MESSAGES.en;
      let str = dict[key] ?? MESSAGES.en[key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
        }
      }
      return str;
    },
    [locale],
  );

  const value = React.useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}

/** Convenience hook when only the translate function is needed. */
export const useT = (): Translate => useI18n().t;
