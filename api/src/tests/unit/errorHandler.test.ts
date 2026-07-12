import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import type { AppEnv } from "../../types/index.js";
import { errorHandler } from "../../middleware/errorHandler.middleware.js";
import { AppError } from "../../utils/apiError.js";

describe("Error Handler Middleware", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    app = new Hono<AppEnv>();
    app.onError(errorHandler);
  });

  it("should format AppError into standard envelope", async () => {
    app.get("/test", () => {
      throw new AppError("TEST_ERROR", "Something went wrong", 400);
    });

    const res = await app.request("/test");
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("TEST_ERROR");
    expect(body.error.message).toBe("Something went wrong");
  });

  it("should return 500 for unknown errors", async () => {
    app.get("/test", () => {
      throw new Error("unexpected");
    });

    const res = await app.request("/test");
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("should return correct status code for 404 AppError", async () => {
    app.get("/test", () => {
      throw new AppError("NOT_FOUND", "Resource not found", 404);
    });

    const res = await app.request("/test");
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("should return correct status code for 409 AppError", async () => {
    app.get("/test", () => {
      throw new AppError("CONFLICT", "Already exists", 409);
    });

    const res = await app.request("/test");
    expect(res.status).toBe(409);
  });
});
