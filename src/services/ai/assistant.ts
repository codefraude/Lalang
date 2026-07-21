import { chatComplete } from "@/services/ai/chat";
import { LANGUAGE_META, type Language } from "@/types/translation";

/**
 * The "assistant agents" — each a specialised prompt over the shared chat
 * endpoint. Turns the translator into a language tutor: explain a translation,
 * offer alternatives, break down grammar, or answer a free question.
 */

export const ASSISTANT_TASKS = ["explain", "alternatives", "grammar", "ask"] as const;
export type AssistantTask = (typeof ASSISTANT_TASKS)[number];

export interface AssistantInput {
  task: AssistantTask;
  sourceText: string;
  resultText: string;
  source: Language;
  target: Language;
  question?: string;
}

export interface Alternative {
  text: string;
  note: string;
}

export interface AssistantResult {
  text?: string;
  alternatives?: Alternative[];
}

const BASE =
  "You are Lalang, an expert, friendly language tutor for the languages of Mauritius (English, French, and Kreol Morisien / Mauritian Creole). Be concise and accurate. Use the standard Akademi Kreol Morisien orthography. Never invent facts about the language.";

export async function runAssistant(input: AssistantInput): Promise<AssistantResult | null> {
  const src = LANGUAGE_META[input.source].nativeLabel;
  const tgt = LANGUAGE_META[input.target].nativeLabel;
  const ctx = `Source (${src}): "${input.sourceText}"\nTranslation (${tgt}): "${input.resultText}"`;

  if (input.task === "alternatives") {
    const raw = await chatComplete({
      json: true,
      system: `${BASE}\nReturn strict JSON: {"alternatives":[{"text":"<a different valid ${tgt} translation>","note":"<≤8 words on when to use it>"}]} with 2-3 items, each meaningfully distinct in tone or phrasing.`,
      user: ctx,
    });
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { alternatives?: Alternative[] };
      const alternatives = (parsed.alternatives ?? []).filter((a) => a?.text).slice(0, 3);
      return { alternatives };
    } catch {
      return null;
    }
  }

  const prompts: Record<Exclude<AssistantTask, "alternatives">, string> = {
    explain: `${BASE}\nIn 2-4 short sentences, explain this translation: the key word choices, tone, and any nuance a learner should notice. No preamble.`,
    grammar: `${BASE}\nGive a compact grammar breakdown of the translation: split it into its key words/particles and gloss each (e.g. "pe = progressive marker"). Use a short bullet list.`,
    ask: BASE,
  };
  const system = prompts[input.task as Exclude<AssistantTask, "alternatives">];
  const user = input.task === "ask" ? `${ctx}\n\nQuestion: ${input.question ?? ""}` : ctx;
  const text = await chatComplete({ system, user });
  return text ? { text } : null;
}
