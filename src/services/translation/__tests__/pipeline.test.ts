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

  // `next/jest` loads the developer's .env, so these assert against an explicitly
  // set key rather than whatever happens to be configured locally — the note the
  // user sees differs by case, and the wrong one sends them to fix the wrong thing.
  const ORIGINAL_KEY = process.env.OPENAI_API_KEY;
  afterEach(() => {
    process.env.OPENAI_API_KEY = ORIGINAL_KEY;
  });

  const noMatch = () =>
    runTranslationPipeline({
      text: "supercalifragilistic nonsense phrase xyz",
      source: "en",
      target: "mfe",
    });

  it("returns the source text gracefully when nothing matches", async () => {
    const result = await noMatch();
    expect(result.resultText).toBeTruthy();
    expect(result.engine).toBe("dictionary");
  });

  it("tells an unconfigured reader to add a key", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await noMatch();
    expect(result.culturalNote).toContain("OPENAI_API_KEY");
  });

  it("blames the provider, not a missing key, when a key is configured", async () => {
    process.env.OPENAI_API_KEY = "sk-test-configured";
    const result = await noMatch();
    expect(result.culturalNote).toContain("AI provider rejected the request");
    expect(result.culturalNote).not.toContain("Add an OPENAI_API_KEY");
  });
});
