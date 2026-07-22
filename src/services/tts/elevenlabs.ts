/**
 * ElevenLabs text-to-speech (plain REST, mirroring the AI chat helper — no SDK).
 *
 * The browser's built-in speech synthesis has no Kreol Morisien voice and falls
 * back to a robotic French one that mispronounces Creole words. ElevenLabs'
 * multilingual model produces natural, human-sounding audio, so pronunciation is
 * far closer for `mfe` (and cleaner for `en`/`fr` too).
 *
 * Returns the MP3 bytes, or `null` when unconfigured / the call fails, so callers
 * can degrade gracefully to browser speech synthesis.
 */

import type { Language } from "@/types/translation";

const BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_MODEL = "eleven_multilingual_v2";
/** "Rachel" — a stock voice present on every account. Override per deployment. */
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";
const TIMEOUT_MS = 20_000;

/** Read a numeric tuning knob from env, with a fallback. */
function envFloat(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return raw === "true" || raw === "1" || raw === "yes";
}

/**
 * Voice tuning. Defaults are set for clear, natural pronunciation:
 *   - similarity_boost high (0.85) → stays close to the chosen voice, crisper;
 *   - use_speaker_boost on → extra presence/clarity;
 *   - style 0 → neutral delivery, best for accurate word pronunciation.
 * Every value is env-overridable so the voice can be dialled in per deployment.
 */
function voiceSettings() {
  return {
    stability: envFloat("ELEVENLABS_STABILITY", 0.5),
    similarity_boost: envFloat("ELEVENLABS_SIMILARITY_BOOST", 0.85),
    style: envFloat("ELEVENLABS_STYLE", 0),
    use_speaker_boost: envBool("ELEVENLABS_SPEAKER_BOOST", true),
  };
}

/**
 * Process-wide LRU of synthesised audio, so a common word is billed once per
 * warm instance instead of once per user/reload. Bounded to keep memory flat.
 */
const MAX_CACHE = 256;
const audioCache = new Map<string, ArrayBuffer>();

function cacheGet(key: string): ArrayBuffer | undefined {
  const hit = audioCache.get(key);
  if (hit) {
    audioCache.delete(key); // refresh recency
    audioCache.set(key, hit);
  }
  return hit;
}

function cacheSet(key: string, value: ArrayBuffer): void {
  if (audioCache.size >= MAX_CACHE) {
    const oldest = audioCache.keys().next().value as string | undefined;
    if (oldest) audioCache.delete(oldest);
  }
  audioCache.set(key, value);
}

export function ttsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/**
 * Resolve the voice for a language. A per-language override
 * (`ELEVENLABS_VOICE_ID_MFE`) wins, then the global `ELEVENLABS_VOICE_ID`, then
 * the stock default — letting a deployment pick a French-native voice for Kreol.
 */
function resolveVoiceId(lang: Language): string {
  const perLang = process.env[`ELEVENLABS_VOICE_ID_${lang.toUpperCase()}`];
  return perLang?.trim() || process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
}

/**
 * Force a pronunciation language (ISO 639-1) per target language. Kreol Morisien
 * is phonetically French-based, so reading it with French rules is far more
 * accurate than letting the model guess the language of a short word. Only sent
 * when set, and only honoured by models that accept `language_code`
 * (eleven_turbo_v2_5 / eleven_flash_v2_5).
 */
function resolveLanguageCode(lang: Language): string | undefined {
  return (
    process.env[`ELEVENLABS_LANGUAGE_CODE_${lang.toUpperCase()}`]?.trim() ||
    process.env.ELEVENLABS_LANGUAGE_CODE?.trim() ||
    undefined
  );
}

/**
 * Deterministic phonetic respellings for words the voice mispronounces, keyed by
 * language → lowercased word → a spelling that reads correctly. This always wins
 * over the model's default reading; extend it as specific words are reported.
 */
const PRONUNCIATION_OVERRIDES: Record<string, Record<string, string>> = {
  mfe: {
    // e.g. "kreol": "créol",  — add entries here when a word sounds wrong.
  },
};

function applyPronunciation(text: string, lang: Language): string {
  const map = PRONUNCIATION_OVERRIDES[lang];
  if (!map || Object.keys(map).length === 0) return text;
  return text.replace(/[\p{L}'-]+/gu, (word) => map[word.toLowerCase()] ?? word);
}

export interface SpeechRequest {
  text: string;
  lang: Language;
}

export async function synthesizeSpeech({ text, lang }: SpeechRequest): Promise<ArrayBuffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || !text.trim()) return null;

  const voiceId = resolveVoiceId(lang);
  const model = process.env.ELEVENLABS_MODEL ?? DEFAULT_MODEL;
  const outputFormat = process.env.ELEVENLABS_OUTPUT_FORMAT?.trim() || DEFAULT_OUTPUT_FORMAT;
  const settings = voiceSettings();
  const languageCode = resolveLanguageCode(lang);
  const spoken = applyPronunciation(text, lang);
  // Everything that affects the audio is in the key, so any change invalidates.
  const cacheKey = `${model}::${voiceId}::${outputFormat}::${languageCode ?? ""}::${JSON.stringify(settings)}::${spoken}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}/${voiceId}?output_format=${outputFormat}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: spoken,
        model_id: model,
        voice_settings: settings,
        ...(languageCode ? { language_code: languageCode } : {}),
      }),
    });
    if (!response.ok) {
      console.error(`[tts] ElevenLabs returned ${response.status}`);
      return null;
    }
    const audio = await response.arrayBuffer();
    cacheSet(cacheKey, audio);
    return audio;
  } catch (error) {
    console.error("[tts] request failed:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
