import type { Language, Register } from "@/types/translation";
import { LANGUAGE_META } from "@/types/translation";

/**
 * Cultural adaptation stage.
 *
 * The heavy lifting (idiom, tone) already happens in the AI stage. This stage's
 * job is to surface a helpful *note* about usage when one is warranted — for
 * example, warning that a slang greeting isn't appropriate with elders. It
 * never rewrites the translation itself; it only annotates.
 */

export interface CulturalAdaptation {
  note?: string;
}

export function adaptCulturally(
  target: Language,
  register: Register,
  existingNote?: string,
): CulturalAdaptation {
  if (existingNote) return { note: existingNote };

  const targetName = LANGUAGE_META[target].nativeLabel;

  if (register === "slang") {
    return {
      note: `This uses informal ${targetName} — great with friends, but choose a softer register for elders or officials.`,
    };
  }

  if (register === "formal") {
    return {
      note: `Formal ${targetName} is less common in daily speech; locals often switch to casual Creole even in semi-formal settings.`,
    };
  }

  return {};
}
