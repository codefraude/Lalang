import { randomToken, hashToken, safeEqualHex, sha1Upper, encryptSecret, decryptSecret } from "@/lib/crypto";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-000000000000000000000000";
  delete process.env.TOTP_ENC_KEY; // force key derivation from AUTH_SECRET
});

describe("token helpers", () => {
  it("generates unique, url-safe tokens", () => {
    const a = randomToken();
    const b = randomToken();
    expect(a).not.toEqual(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hashes deterministically", () => {
    expect(hashToken("hello")).toEqual(hashToken("hello"));
    expect(hashToken("hello")).not.toEqual(hashToken("world"));
    expect(hashToken("hello")).toHaveLength(64);
  });

  it("compares hex in constant time", () => {
    const h = hashToken("x");
    expect(safeEqualHex(h, h)).toBe(true);
    expect(safeEqualHex(h, hashToken("y"))).toBe(false);
    expect(safeEqualHex(h, "abc")).toBe(false);
  });

  it("produces an uppercase SHA-1 for HIBP", () => {
    // Known SHA-1 of "password" is 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    expect(sha1Upper("password")).toBe("5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8");
  });
});

describe("AES-256-GCM secret sealing", () => {
  it("round-trips a secret", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const sealed = encryptSecret(secret);
    expect(sealed).not.toContain(secret);
    expect(decryptSecret(sealed)).toBe(secret);
  });

  it("fails to decrypt tampered ciphertext", () => {
    const sealed = encryptSecret("value");
    const tampered = sealed.slice(0, -4) + (sealed.endsWith("A") ? "BBBB" : "AAAA");
    expect(() => decryptSecret(tampered)).toThrow();
  });
});
