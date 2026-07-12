import { describe, it, expect } from "vitest";
import {
  completeProfileSchema,
  refreshTokenSchema,
} from "../../validators/auth.validator.js";
import {
  createSubmissionSchema,
  updateProfileSchema,
  taskFilterSchema,
} from "../../validators/user.validator.js";
import {
  submitReviewSchema,
  editReviewSchema,
} from "../../validators/judge.validator.js";
import {
  createTaskSchema,
  updateUserSchema,
  overrideReviewSchema,
  createPostSchema,
} from "../../validators/admin.validator.js";

describe("Auth Validators", () => {
  describe("completeProfileSchema", () => {
    it("should accept valid data", () => {
      const result = completeProfileSchema.safeParse({
        fullName: "John Doe",
        collegeName: "MIT",
        branch: "Computer Science",
        year: "3rd",
        phone: "+1-555-0100",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing required fields", () => {
      const result = completeProfileSchema.safeParse({ fullName: "John" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid phone", () => {
      const result = completeProfileSchema.safeParse({
        fullName: "John Doe",
        collegeName: "MIT",
        branch: "CS",
        year: "3rd",
        phone: "not-a-phone!!!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("refreshTokenSchema", () => {
    it("should accept valid token", () => {
      const result = refreshTokenSchema.safeParse({
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty token", () => {
      const result = refreshTokenSchema.safeParse({ refreshToken: "" });
      expect(result.success).toBe(false);
    });
  });
});

describe("User Validators", () => {
  describe("createSubmissionSchema", () => {
    it("should accept valid submission", () => {
      const result = createSubmissionSchema.safeParse({
        taskId: "550e8400-e29b-41d4-a716-446655440000",
        repoId: "123456",
        repoUrl: "https://github.com/user/repo",
        repoName: "my-repo",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for taskId", () => {
      const result = createSubmissionSchema.safeParse({
        taskId: "not-a-uuid",
        repoId: "123",
        repoUrl: "https://github.com/user/repo",
        repoName: "repo",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("taskFilterSchema", () => {
    it("should accept empty object (all defaults)", () => {
      const result = taskFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(20);
    });

    it("should accept valid filters", () => {
      const result = taskFilterSchema.safeParse({
        category: "web",
        difficulty: "hard",
        limit: 50,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid difficulty", () => {
      const result = taskFilterSchema.safeParse({ difficulty: "impossible" });
      expect(result.success).toBe(false);
    });
  });
});

describe("Judge Validators", () => {
  describe("submitReviewSchema", () => {
    it("should accept valid review", () => {
      const result = submitReviewSchema.safeParse({
        totalScore: 85,
        feedback: "Great work on the implementation!",
        decision: "approved",
      });
      expect(result.success).toBe(true);
    });

    it("should reject score > 100", () => {
      const result = submitReviewSchema.safeParse({
        totalScore: 150,
        feedback: "test",
        decision: "approved",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid decision", () => {
      const result = submitReviewSchema.safeParse({
        totalScore: 50,
        feedback: "test",
        decision: "maybe",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Admin Validators", () => {
  describe("createTaskSchema", () => {
    it("should accept valid task", () => {
      const result = createTaskSchema.safeParse({
        title: "Build a REST API",
        description: "Build a complete REST API with authentication and authorization",
        category: "backend",
        difficulty: "medium",
        points: 50,
      });
      expect(result.success).toBe(true);
    });

    it("should default rankRequired to Ronin", () => {
      const result = createTaskSchema.safeParse({
        title: "Test Task",
        description: "A test task description here",
        category: "test",
        difficulty: "easy",
        points: 10,
      });
      expect(result.success).toBe(true);
      expect(result.data?.rankRequired).toBe("Ronin");
    });
  });

  describe("overrideReviewSchema", () => {
    it("should accept partial overrides", () => {
      const result = overrideReviewSchema.safeParse({
        totalScore: 95,
      });
      expect(result.success).toBe(true);
    });

    it("should accept decision-only override", () => {
      const result = overrideReviewSchema.safeParse({
        decision: "approved",
      });
      expect(result.success).toBe(true);
    });
  });
});
