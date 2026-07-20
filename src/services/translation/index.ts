export { runTranslationPipeline } from "./pipeline";
export { detectLanguage } from "./language-detection";
export { analyzeContext } from "./context-analysis";
export { translateWithDictionary, normalize } from "./dictionary-fallback";
export {
  PHRASE_BOOK,
  WORD_BOOK,
  DICTIONARY_ENTRIES,
} from "./dictionary-data";
export type {
  PhraseEntry,
  SeedDictionaryEntry,
  DictionaryCategory,
} from "./dictionary-data";
