/**
 * Grammar / surface-correction stage.
 *
 * Deliberately conservative: it normalises whitespace, punctuation spacing and
 * sentence casing without touching the actual words (so it never corrupts a
 * correct Creole translation). Deeper, language-aware correction is a good
 * candidate for a future AI-assisted pass.
 */

export interface GrammarResult {
  text: string;
  changed: boolean;
}

export function correctGrammar(text: string): GrammarResult {
  const original = text;

  let out = text
    .replace(/\s+/g, " ") // collapse runs of whitespace
    .replace(/\s+([,.!?;:])/g, "$1") // no space before punctuation
    .replace(/([,.!?;:])(?=[^\s])/g, "$1 ") // ensure space after punctuation
    .trim();

  // Capitalise the first alphabetic character of the string.
  out = out.replace(/^(\s*)(\p{L})/u, (_, lead, ch) => lead + ch.toUpperCase());

  return { text: out, changed: out !== original };
}
