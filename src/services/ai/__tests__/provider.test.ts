import {
  aiModel,
  chatCompletionsUrl,
  isReasoningModel,
  samplingParams,
} from "../provider";

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.OPENAI_MODEL;
  delete process.env.OPENAI_BASE_URL;
  delete process.env.OPENAI_REASONING_EFFORT;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("aiModel", () => {
  it("defaults to the flagship model", () => {
    expect(aiModel()).toBe("gpt-5.5");
  });

  it("honours OPENAI_MODEL", () => {
    process.env.OPENAI_MODEL = "openai/gpt-4.1";
    expect(aiModel()).toBe("openai/gpt-4.1");
  });
});

describe("chatCompletionsUrl", () => {
  it("defaults to the OpenAI endpoint", () => {
    expect(chatCompletionsUrl()).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("strips trailing slashes from a custom base URL", () => {
    process.env.OPENAI_BASE_URL = "https://models.github.ai/inference//";
    expect(chatCompletionsUrl()).toBe("https://models.github.ai/inference/chat/completions");
  });
});

describe("isReasoningModel", () => {
  it.each(["gpt-5", "gpt-5.5", "gpt-5.4-mini", "o3-mini", "o1", "openai/gpt-5.5"])(
    "treats %s as a reasoning model",
    (model) => {
      expect(isReasoningModel(model)).toBe(true);
    },
  );

  it.each(["gpt-4o-mini", "gpt-4.1", "gpt-5.2-chat-latest", "openai/gpt-4.1", "mistral-large"])(
    "treats %s as a classic chat model",
    (model) => {
      expect(isReasoningModel(model)).toBe(false);
    },
  );
});

describe("samplingParams", () => {
  it("sends temperature to classic chat models", () => {
    expect(samplingParams("gpt-4.1", 0.3)).toEqual({ temperature: 0.3 });
  });

  it("sends reasoning_effort instead of temperature to reasoning models", () => {
    expect(samplingParams("gpt-5.5", 0.3)).toEqual({ reasoning_effort: "low" });
  });

  it("honours OPENAI_REASONING_EFFORT", () => {
    process.env.OPENAI_REASONING_EFFORT = "high";
    expect(samplingParams("gpt-5.5", 0.3)).toEqual({ reasoning_effort: "high" });
  });
});
