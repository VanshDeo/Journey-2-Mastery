import { describe, it, expect } from "vitest";
import {
  AppError,
  notFound,
  unauthorized,
  forbidden,
  conflict,
  tooManyRequests,
  badRequest,
} from "../../utils/apiError";

describe("AppError", () => {
  it("should create an error with correct properties", () => {
    const err = new AppError("TEST", "test message", 422);
    expect(err.code).toBe("TEST");
    expect(err.message).toBe("test message");
    expect(err.statusCode).toBe(422);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("should default to 400 status code", () => {
    const err = new AppError("TEST", "test");
    expect(err.statusCode).toBe(400);
  });
});

describe("Error factory functions", () => {
  it("notFound should return 404", () => {
    const err = notFound("User", "abc-123");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("USER_NOT_FOUND");
    expect(err.message).toContain("User");
  });

  it("unauthorized should return 401", () => {
    const err = unauthorized("Bad token");
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Bad token");
  });

  it("forbidden should return 403", () => {
    const err = forbidden("No access");
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });

  it("conflict should return 409", () => {
    const err = conflict("Already exists", "DUPLICATE");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("DUPLICATE");
  });

  it("tooManyRequests should return 429", () => {
    const err = tooManyRequests();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("badRequest should return 400 with custom code", () => {
    const err = badRequest("Invalid input", "VALIDATION_ERROR");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Invalid input");
  });
});
