import { scorePassword } from "@/lib/password-strength";

describe("scorePassword", () => {
  it("scores an empty password as zero", () => {
    const result = scorePassword("");
    expect(result.score).toBe(0);
    expect(result.percent).toBe(0);
  });

  it("caps common passwords at very weak", () => {
    expect(scorePassword("password").score).toBeLessThanOrEqual(1);
    expect(scorePassword("password1").score).toBeLessThanOrEqual(1);
  });

  it("rates a long, varied password as strong", () => {
    const result = scorePassword("Tr0ub4dour&3xplore!");
    expect(result.score).toBe(4);
    expect(result.label).toBe("Strong");
    expect(result.checks.symbol).toBe(true);
    expect(result.checks.number).toBe(true);
    expect(result.checks.uppercase).toBe(true);
  });

  it("reflects individual requirement checks", () => {
    const checks = scorePassword("abcdefgh").checks;
    expect(checks.length).toBe(true);
    expect(checks.uppercase).toBe(false);
    expect(checks.number).toBe(false);
    expect(checks.symbol).toBe(false);
  });

  it("increases score with length and variety", () => {
    const weak = scorePassword("abc").score;
    const stronger = scorePassword("Abcd1234!x").score;
    expect(stronger).toBeGreaterThan(weak);
  });
});
