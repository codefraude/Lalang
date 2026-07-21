/**
 * @jest-environment node
 */
import * as OTPAuth from "otpauth";
import {
  generateTotpSecret,
  verifyTotp,
  generateBackupCodes,
  normalizeBackupCode,
  hashBackupCodes,
  findMatchingBackupCode,
} from "@/lib/totp";

describe("TOTP", () => {
  it("generates a base32 secret", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(16);
  });

  it("verifies a valid current code", () => {
    const secret = generateTotpSecret();
    const totp = new OTPAuth.TOTP({
      issuer: "Lalang",
      label: "test",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const code = totp.generate();
    const result = verifyTotp(secret, code);
    expect(result).not.toBeNull();
    expect(typeof result?.step).toBe("number");
  });

  it("rejects an invalid code", () => {
    const secret = generateTotpSecret();
    expect(verifyTotp(secret, "000000")).toBeNull();
  });
});

describe("backup codes", () => {
  it("generates ten formatted codes", () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(10);
    expect(codes[0]).toMatch(/^[0-9a-f]{5}-[0-9a-f]{5}$/);
  });

  it("normalizes codes for comparison", () => {
    expect(normalizeBackupCode("AB12C-3D4E5")).toBe("ab12c3d4e5");
  });

  it("matches a hashed code once, tolerating formatting", async () => {
    const [code] = generateBackupCodes(1);
    const [hash] = await hashBackupCodes([code]);
    const matched = await findMatchingBackupCode(code.toUpperCase(), [hash]);
    expect(matched).toBe(hash);
    const miss = await findMatchingBackupCode("00000-00000", [hash]);
    expect(miss).toBeNull();
  });
});
