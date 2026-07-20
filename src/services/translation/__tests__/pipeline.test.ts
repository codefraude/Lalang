import { runTranslationPipeline } from "@/services/translation/pipeline";
import { detectLanguage } from "@/services/translation/language-detection";
import { translateWithDictionary } from "@/services/translation/dictionary-fallback";

// The AI stage is mocked off so these tests deterministically exercise the
// offline dictionary path — proving the app produces correct Creole with zero
// configuration, regardless of whether a key happens to be set in the env.
jest.mock("@/services/translation/ai-translator", () => ({
  translateWithAi: jest.fn().mockResolvedValue(null),
}));

describe("language detection", () => {
  it("detects English", () => {
    expect(detectLanguage("I'm very tired today").language).toBe("en");
  });

  it("detects French", () => {
    expect(detectLanguage("Je suis très fatigué aujourd'hui").language).toBe("fr");
  });

  it("detects Mauritian Creole", () => {
    expect(detectLanguage("Mo bien fatige zordi").language).toBe("mfe");
  });
});

describe("dictionary fallback", () => {
  it("translates the key example into Mauritian Creole", () => {
    const match = translateWithDictionary("I'm very tired today", "en", "mfe");
    expect(match?.text).toBe("mo bien fatige zordi");
  });
});

describe("full pipeline (offline)", () => {
  it("produces Mauritian Creole with grammar-corrected casing", async () => {
    const result = await runTranslationPipeline({
      text: "I'm very tired today",
      source: "auto",
      target: "mfe",
    });
    expect(result.engine).toBe("dictionary");
    expect(result.source).toBe("en");
    // Grammar stage capitalises the first letter.
    expect(result.resultText).toBe("Mo bien fatige zordi");
    expect(result.trace.map((t) => t.stage)).toEqual([
      "detection",
      "context",
      "dictionary",
      "grammar",
      "cultural",
    ]);
  });

  it("returns the source text gracefully when nothing matches", async () => {
    const result = await runTranslationPipeline({
      text: "supercalifragilistic nonsense phrase xyz",
      source: "en",
      target: "mfe",
    });
    expect(result.resultText).toBeTruthy();
    expect(result.culturalNote).toContain("OPENAI_API_KEY");
  });
});
