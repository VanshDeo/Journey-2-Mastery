import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../../utils/encryption.js";

describe("Encryption", () => {
  const testCases = [
    "simple-text",
    "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "special chars: @#$%^&*()_+-=[]{}",
    "unicode: 日本語テスト",
    "",
  ];

  for (const original of testCases) {
    it(`should encrypt and decrypt: "${original.slice(0, 30)}..."`, () => {
      const encrypted = encrypt(original);
      expect(encrypted).not.toBe(original);

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });
  }

  it("should produce different ciphertexts for the same plaintext (random IV)", () => {
    const plaintext = "test-token-12345";
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);

    expect(encrypted1).not.toBe(encrypted2); // Random IV → different output
    expect(decrypt(encrypted1)).toBe(plaintext);
    expect(decrypt(encrypted2)).toBe(plaintext);
  });

  it("should throw on tampered ciphertext", () => {
    const encrypted = encrypt("test");
    const tampered = encrypted.slice(0, -2) + "xx";
    expect(() => decrypt(tampered)).toThrow();
  });
});
