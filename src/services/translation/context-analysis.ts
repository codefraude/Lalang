import type { Register } from "@/types/translation";
import { REGISTER_META } from "@/types/translation";

export interface ContextAnalysis {
  register: Register;
  /** A short instruction the AI stage can inject into its prompt. */
  guidance: string;
  /** Whether the text looks like it needs softening (formal → natural). */
  wasInferred: boolean;
}

/**
 * Resolve the register for a translation.
 *
 * If the user explicitly picked one, we trust it. Otherwise we infer a
 * reasonable default from surface cues (punctuation, length, formality words).
 */
export function analyzeContext(
  text: string,
  explicit?: Register,
): ContextAnalysis {
  if (explicit) {
    return {
      register: explicit,
      guidance: REGISTER_META[explicit].hint,
      wasInferred: false,
    };
  }

  const lower = text.toLowerCase();
  let register: Register = "casual";

  const formalCues = ["dear", "sincerely", "regards", "veuillez", "madame", "monsieur", "cordialement"];
  const slangCues = ["lol", "wtf", "bro", "yo", "😂", "🔥"];

  if (formalCues.some((c) => lower.includes(c))) {
    register = "formal";
  } else if (slangCues.some((c) => lower.includes(c))) {
    register = "slang";
  } else if (text.length > 240) {
    register = "business";
  }

  return {
    register,
    guidance: REGISTER_META[register].hint,
    wasInferred: true,
  };
}
