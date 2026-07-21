import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  changeEmailSchema,
} from "@/lib/validations/auth";
import { updateProfileSchema } from "@/lib/validations/profile";

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "Ada@Example.com",
      password: "sup3rSecret!",
      terms: true,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("ada@example.com"); // normalized
  });

  it("requires accepting the terms", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "sup3rSecret!",
      terms: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords and long ones beyond bcrypt's limit", () => {
    expect(registerSchema.safeParse({ name: "A", email: "a@b.co", password: "short", terms: true }).success).toBe(false);
    expect(
      registerSchema.safeParse({ name: "A", email: "a@b.co", password: "x".repeat(73), terms: true }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("defaults rememberMe and allows optional 2FA fields", () => {
    const result = loginSchema.safeParse({ email: "a@b.co", password: "x" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rememberMe).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires a token and a valid password", () => {
    expect(resetPasswordSchema.safeParse({ token: "", password: "goodPass1" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "t", password: "goodPass1" }).success).toBe(true);
  });
});

describe("changeEmailSchema", () => {
  it("normalizes the new email", () => {
    const result = changeEmailSchema.safeParse({ newEmail: "NEW@X.CO", password: "p" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.newEmail).toBe("new@x.co");
  });
});

describe("updateProfileSchema", () => {
  it("rejects invalid website URLs but allows clearing with empty string", () => {
    expect(updateProfileSchema.safeParse({ website: "not-a-url" }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ website: "" }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ website: "https://ok.dev" }).success).toBe(true);
  });

  it("enforces the 280-character bio limit", () => {
    expect(updateProfileSchema.safeParse({ bio: "x".repeat(281) }).success).toBe(false);
  });

  it("validates social links as URLs", () => {
    expect(updateProfileSchema.safeParse({ socials: { github: "https://github.com/x" } }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ socials: { github: "nope" } }).success).toBe(false);
  });
});
