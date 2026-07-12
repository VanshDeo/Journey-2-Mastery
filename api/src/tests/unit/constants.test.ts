import { describe, it, expect } from "vitest";
import {
  isRankSufficient,
  RANK_ORDER,
  ROLE_ADMIN,
  ROLE_JUDGE,
  ROLE_USER,
  STATUS_PENDING,
  STATUS_IN_REVIEW,
  STATUS_APPROVED,
  STATUS_REJECTED,
  AUDIT_ACTIONS,
  NOTIFICATION_TYPES,
  CACHE_KEYS,
  CACHE_TTL,
} from "../../utils/constants.js";

describe("Constants", () => {
  describe("isRankSufficient", () => {
    it("Ronin can access Ronin tasks", () => {
      expect(isRankSufficient("Ronin", "Ronin")).toBe(true);
    });

    it("Samurai can access Ronin tasks", () => {
      expect(isRankSufficient("Samurai", "Ronin")).toBe(true);
    });

    it("Shogun can access all tasks", () => {
      expect(isRankSufficient("Shogun", "Ronin")).toBe(true);
      expect(isRankSufficient("Shogun", "Kenshi")).toBe(true);
      expect(isRankSufficient("Shogun", "Samurai")).toBe(true);
      expect(isRankSufficient("Shogun", "Shogun")).toBe(true);
    });

    it("Ronin cannot access Kenshi tasks", () => {
      expect(isRankSufficient("Ronin", "Kenshi")).toBe(false);
    });

    it("Kenshi cannot access Samurai tasks", () => {
      expect(isRankSufficient("Kenshi", "Samurai")).toBe(false);
    });
  });

  describe("RANK_ORDER", () => {
    it("should have correct ordering as array", () => {
      expect(RANK_ORDER).toEqual(["Ronin", "Kenshi", "Samurai", "Shogun"]);
      expect(RANK_ORDER.indexOf("Ronin")).toBeLessThan(RANK_ORDER.indexOf("Kenshi"));
      expect(RANK_ORDER.indexOf("Kenshi")).toBeLessThan(RANK_ORDER.indexOf("Samurai"));
      expect(RANK_ORDER.indexOf("Samurai")).toBeLessThan(RANK_ORDER.indexOf("Shogun"));
    });
  });

  describe("Roles", () => {
    it("should have all three role constants", () => {
      expect(ROLE_ADMIN).toBe("admin");
      expect(ROLE_JUDGE).toBe("judge");
      expect(ROLE_USER).toBe("user");
    });
  });

  describe("CACHE_KEYS", () => {
    it("should generate correct user repos key", () => {
      expect(CACHE_KEYS.userRepos("user-123")).toBe("user:user-123:repos");
    });

    it("should generate correct JWT blacklist key", () => {
      expect(CACHE_KEYS.jwtBlacklist("jti-abc")).toBe("jwt:blacklist:jti-abc");
    });
  });

  describe("Statuses", () => {
    it("should have correct status strings", () => {
      expect(STATUS_PENDING).toBe("pending");
      expect(STATUS_IN_REVIEW).toBe("in_review");
      expect(STATUS_APPROVED).toBe("approved");
      expect(STATUS_REJECTED).toBe("rejected");
    });
  });
});
