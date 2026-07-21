"use client";

import * as React from "react";

/**
 * SSR-safe persisted state. Renders `initial` on the server and first client
 * paint (avoiding hydration mismatches), then rehydrates from localStorage.
 * `hydrated` lets callers defer progress-dependent UI until real data is loaded.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = React.useState<T>(initial);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* corrupt or unavailable storage — fall back to initial */
    }
    setHydrated(true);
  }, [key]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode — ignore */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
