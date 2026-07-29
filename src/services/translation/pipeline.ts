import type {
  TranslationRequest,
  TranslationResult,
  Language,
  PipelineStageTrace,
} from "@/types/translation";
import { detectLanguage } from "./language-detection";
import { analyzeContext } from "./context-analysis";
import { translateWithAi } from "./ai-translator";
import { translateWithDictionary } from "./dictionary-fallback";
import { correctGrammar } from "./grammar-correction";
import { adaptCulturally } from "./cultural-adaptation";
import { noCoverageNote } from "@/services/ai/provider";

/**
 * The translation pipeline, following the spec flow:
 *
 *   input → detect → analyse context → AI translate → grammar → cultural → output
 *
 * The AI stage is optional: if no key is configured (or it fails) the pipeline
 * degrades gracefully to the offline dictionary, so it always returns a result.
 */
export async function runTranslationPipeline(
  request: TranslationRequest,
): Promise<TranslationResult> {
  const trace: PipelineStageTrace[] = [];
  const text = request.text.trim();

  // 1. Language detection ---------------------------------------------------
  const detection = detectLanguage(text);
  const source: Language =
    request.source === "auto" ? detection.language : request.source;
  trace.push({
    stage: "detection",
    detail:
      request.source === "auto"
        ? `auto → ${source} (${Math.round(detection.confidence * 100)}%)`
        : `source fixed to ${source}`,
  });

  // 2. Context analysis -----------------------------------------------------
  const context = analyzeContext(text, request.register);
  trace.push({
    stage: "context",
    detail: `${context.register}${context.wasInferred ? " (inferred)" : ""}`,
  });

  // 3. AI translation (optional) -------------------------------------------
  const ai = await translateWithAi({
    text,
    source,
    target: request.target,
    register: context.register,
    guidance: context.guidance,
  });

  let resultText: string;
  let engine: TranslationResult["engine"];
  let culturalNote: string | undefined;

  if (ai) {
    resultText = ai.text;
    engine = "ai";
    culturalNote = ai.culturalNote;
    trace.push({ stage: "ai", detail: "translated via OpenAI" });
  } else {
    // 3b. Dictionary fallback ----------------------------------------------
    const dict = translateWithDictionary(text, source, request.target);
    if (dict) {
      resultText = dict.text;
      engine = "dictionary";
      culturalNote = dict.note;
      trace.push({
        stage: "dictionary",
        detail: `${dict.matchType} (coverage ${Math.round(dict.coverage * 100)}%)`,
      });
    } else {
      resultText = text;
      engine = "dictionary";
      culturalNote = noCoverageNote();
      trace.push({ stage: "dictionary", detail: "no match — returned source" });
    }
  }

  // 4. Grammar correction ---------------------------------------------------
  const grammar = correctGrammar(resultText);
  resultText = grammar.text;
  trace.push({
    stage: "grammar",
    detail: grammar.changed ? "normalised" : "no changes",
  });

  // 5. Cultural adaptation --------------------------------------------------
  const cultural = adaptCulturally(request.target, context.register, culturalNote);
  culturalNote = cultural.note;
  trace.push({
    stage: "cultural",
    detail: culturalNote ? "note attached" : "no note",
  });

  // 6. Final output ---------------------------------------------------------
  return {
    sourceText: text,
    resultText,
    source,
    target: request.target,
    register: context.register,
    engine,
    detection,
    culturalNote,
    trace,
  };
}
