"use client";

import * as React from "react";

const LOCALE: Record<string, string> = { en: "en-GB", fr: "fr-FR", mfe: "fr-FR" };

/** Browser text-to-speech with adjustable rate (for a "slow read" mode). */
export function useSpeak() {
  const [speaking, setSpeaking] = React.useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = React.useCallback((text: string, lang: string, rate = 1) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LOCALE[lang] ?? lang;
    utter.rate = rate;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, supported };
}
