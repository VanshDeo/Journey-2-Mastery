import type { Context } from "hono";
import type { AppEnv } from "../types/index";
import { AppError } from "../utils/apiError";
import { env } from "../config/env";
import { logger } from "../config/logger";

/**
 * Centralized error handler middleware.
 * Catches all errors and formats them into the standard envelope.
 * Must be registered as app.onError() — NOT as regular middleware.
 */
export function errorHandler(err: Error, c: Context<AppEnv>) {
  const requestId = c.get("requestId") ?? "unknown";

  // Known operational errors (AppError)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId }, `Server error: ${err.message}`);
    } else {
      logger.warn({ requestId, code: err.code }, err.message);
    }

    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.statusCode
    );
  }

  // Zod validation errors (from @hono/zod-validator when not caught)
  if (err.name === "ZodError") {
    return c.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
        },
      },
      400
    );
  }

  // Unknown / unexpected errors — never leak stack traces in prod
  logger.error({ err, requestId }, "Unhandled error");

  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : err.message || "An unexpected error occurred",
      },
    },
    500
  );
}
