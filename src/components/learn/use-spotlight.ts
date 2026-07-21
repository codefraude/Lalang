"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Tracks the pointer as `--mx` / `--my` CSS custom properties on an element so a
 * radial "spotlight" background can follow the cursor. Progressive enhancement
 * only: mouse pointers with motion allowed. Writes style vars directly, so it
 * triggers zero React re-renders.
 */
export function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const ref = React.useRef<T>(null);
  const reduce = useReducedMotion();

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<T>) => {
      if (reduce || e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    },
    [reduce],
  );

  return { ref, onPointerMove };
}
