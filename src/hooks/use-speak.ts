"use client";

import * as React from "react";

/** Locale hints for the browser fallback voice only. */
const LOCALE: Record<string, string> = { en: "en-GB", fr: "fr-FR", mfe: "fr-FR" };

const MAX_CACHE = 40;
/** Per-session cache of synthesised audio (object URLs), keyed by phrase — so
 *  replaying a word never re-hits (or re-bills) the voice service. */
const audioCache = new Map<string, string>();
/** Flipped once `/api/tts` answers 503, so we stop probing an unconfigured server. */
let serverUnavailable = false;
/** The single audio element playing across every hook instance, plus a hook back
 *  into its owner — so any instance can stop it, mirroring the global semantics
 *  `speechSynthesis.cancel()` already gives the browser fallback. */
let activeAudio: HTMLAudioElement | null = null;
let activeUrl: string | null = null;
let releaseActive: (() => void) | null = null;

function stopActive(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  activeUrl = null;
  const release = releaseActive;
  releaseActive = null;
  release?.();
}

function cacheKey(text: string, lang: string): string {
  return `${lang}::${text}`;
}

function putInCache(key: string, url: string): void {
  if (audioCache.size >= MAX_CACHE) {
    const oldest = audioCache.keys().next().value as string | undefined;
    if (oldest) {
      const oldUrl = audioCache.get(oldest);
      audioCache.delete(oldest);
      if (oldUrl && oldUrl !== activeUrl) URL.revokeObjectURL(oldUrl);
    }
  }
  audioCache.set(key, url);
}

/**
 * Text-to-speech with an adjustable rate (for a "slow read" mode). Prefers the
 * server ElevenLabs voice for natural pronunciation — the browser's built-in
 * synthesis has no Kreol voice and mangles Creole words — and falls back to that
 * built-in synthesis when the voice service is unconfigured or unreachable.
 */
export function useSpeak() {
  const [speaking, setSpeaking] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const requestRef = React.useRef(0);

  const supported = typeof window !== "undefined";

  const stop = React.useCallback(() => {
    requestRef.current += 1; // invalidate any in-flight fetch
    if (audioRef.current) {
      if (activeAudio === audioRef.current) stopActive();
      else audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speakWithBrowser = React.useCallback((text: string, lang: string, rate: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LOCALE[lang] ?? lang;
    utter.rate = rate;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }, []);

  const playUrl = React.useCallback((url: string, rate: number, token: number) => {
    if (token !== requestRef.current) return;
    stopActive(); // stop whatever any instance is currently playing
    const audio = new Audio(url);
    audio.playbackRate = rate; // preserves pitch by default — natural "slow read"
    const done = () => {
      setSpeaking(false);
      if (activeAudio === audio) stopActive();
    };
    audio.onended = done;
    audio.onerror = done;
    audioRef.current = audio;
    activeAudio = audio;
    activeUrl = url;
    releaseActive = () => setSpeaking(false);
    setSpeaking(true);
    void audio.play().catch(done);
  }, []);

  const speak = React.useCallback(
    async (text: string, lang: string, rate = 1) => {
      if (typeof window === "undefined" || !text.trim()) return;
      stop();
      stopActive(); // also stop any *other* instance mid-playback
      const token = requestRef.current;

      if (serverUnavailable) {
        speakWithBrowser(text, lang, rate);
        return;
      }

      const key = cacheKey(text, lang);
      const cached = audioCache.get(key);
      if (cached) {
        audioCache.delete(key); // refresh recency (LRU)
        audioCache.set(key, cached);
        playUrl(cached, rate, token);
        return;
      }

      setSpeaking(true);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, lang }),
        });
        if (token !== requestRef.current) return; // superseded or stopped
        if (res.status === 503) {
          serverUnavailable = true;
          speakWithBrowser(text, lang, rate);
          return;
        }
        if (!res.ok) {
          speakWithBrowser(text, lang, rate);
          return;
        }
        const blob = await res.blob();
        if (token !== requestRef.current) return;
        const url = URL.createObjectURL(blob);
        putInCache(key, url);
        playUrl(url, rate, token);
      } catch {
        if (token !== requestRef.current) return;
        speakWithBrowser(text, lang, rate);
      }
    },
    [stop, speakWithBrowser, playUrl],
  );

  React.useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, supported };
}
