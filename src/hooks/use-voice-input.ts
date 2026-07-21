"use client";

import * as React from "react";

/** Minimal shape of the Web Speech API we use (avoids `any`). */
interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

function getCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const LOCALE: Record<string, string> = { en: "en-GB", fr: "fr-FR", mfe: "fr-FR" };

/** Browser speech-to-text (Chrome/Edge/Safari). No dependency. */
export function useVoiceInput(lang: string, onResult: (text: string) => void) {
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(false);
  const recRef = React.useRef<RecognitionLike | null>(null);

  React.useEffect(() => {
    setSupported(Boolean(getCtor()));
    return () => recRef.current?.stop();
  }, []);

  const toggle = React.useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = LOCALE[lang] ?? lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [lang, listening, onResult]);

  return { listening, supported, toggle };
}
