import type { DetectionResult, Language } from "@/types/translation";

/**
 * Heuristic language detection.
 *
 * This is deliberately dependency-free so it works offline and on the edge.
 * It scores the input against characteristic "marker" words for each language.
 * Distinctive grammatical markers (pronouns, tense particles) are weighted
 * higher than shared vocabulary.
 *
 * When an OpenAI key is configured, the AI stage can override this with a more
 * confident detection — but this guarantees the pipeline always has an answer.
 */

interface Marker {
  token: string;
  weight: number;
}

const MARKERS: Record<Language, Marker[]> = {
  // English function words + common vocabulary.
  en: [
    { token: "the", weight: 3 },
    { token: "is", weight: 2 },
    { token: "am", weight: 3 },
    { token: "are", weight: 2 },
    { token: "you", weight: 2 },
    { token: "i", weight: 1 },
    { token: "today", weight: 2 },
    { token: "very", weight: 1 },
    { token: "how", weight: 1 },
    { token: "what", weight: 1 },
    { token: "tired", weight: 2 },
    { token: "happy", weight: 1 },
  ],
  // French: accented words and grammar are strong signals.
  fr: [
    { token: "je", weight: 4 },
    { token: "suis", weight: 4 },
    { token: "vous", weight: 3 },
    { token: "tu", weight: 2 },
    { token: "est", weight: 2 },
    { token: "très", weight: 3 },
    { token: "aujourd'hui", weight: 4 },
    { token: "bonjour", weight: 2 },
    { token: "heureux", weight: 3 },
    { token: "comment", weight: 2 },
    { token: "rencontrer", weight: 3 },
    { token: "merci", weight: 1 },
  ],
  // Mauritian Creole: mo/to/li pronouns + "pe" progressive + "zordi".
  mfe: [
    { token: "mo", weight: 4 },
    { token: "to", weight: 3 },
    { token: "li", weight: 2 },
    { token: "pe", weight: 3 },
    { token: "zordi", weight: 4 },
    { token: "kouma", weight: 3 },
    { token: "ki", weight: 1 },
    { token: "fer", weight: 2 },
    { token: "zwenn", weight: 3 },
    { token: "twa", weight: 2 },
    { token: "ena", weight: 3 },
    { token: "napa", weight: 3 },
    { token: "zot", weight: 1 },
    { token: "bann", weight: 2 },
  ],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}'\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function detectLanguage(text: string): DetectionResult {
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);

  const scores: Record<Language, number> = { en: 0, fr: 0, mfe: 0 };
  const hits: Record<Language, string[]> = { en: [], fr: [], mfe: [] };

  for (const lang of Object.keys(MARKERS) as Language[]) {
    for (const marker of MARKERS[lang]) {
      if (tokenSet.has(marker.token)) {
        scores[lang] += marker.weight;
        hits[lang].push(marker.token);
      }
    }
  }

  // Accented Latin characters not typical of English/Creole nudge toward French.
  if (/[àâçèêëîïôûùüÿœ]/i.test(text)) scores.fr += 2;

  const ranked = (Object.keys(scores) as Language[]).sort(
    (a, b) => scores[b] - scores[a],
  );
  const best = ranked[0];
  const bestScore = scores[best];
  const runnerUp = scores[ranked[1]] ?? 0;

  // Fall back to English when we have essentially no signal.
  const language: Language = bestScore === 0 ? "en" : best;

  // Confidence: how dominant the winner is over the runner-up, capped to [0.3, 0.98].
  const total = bestScore + runnerUp || 1;
  const rawConfidence = bestScore === 0 ? 0.3 : bestScore / total;
  const confidence = Math.min(0.98, Math.max(0.3, rawConfidence));

  const signals =
    bestScore === 0
      ? ["No strong markers found — defaulted to English."]
      : hits[language].map((t) => `matched "${t}"`);

  return { language, confidence, signals };
}
