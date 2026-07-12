import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Custom application error.
 * Thrown in services, caught by errorHandler middleware.
 * Automatically formatted into the standard error envelope.
 */
export class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    code: string,
    message: string,
    statusCode: ContentfulStatusCode = 400,
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

// ──────────────────────────────────────────────
// Common error factory helpers
// ──────────────────────────────────────────────

export function notFound(resource: string, id?: string): AppError {
  const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
  return new AppError(`${resource.toUpperCase().replace(/\s+/g, "_")}_NOT_FOUND`, message, 404);
}

export function unauthorized(message = "Authentication required"): AppError {
  return new AppError("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Insufficient permissions"): AppError {
  return new AppError("FORBIDDEN", message, 403);
}

export function conflict(message: string, code = "CONFLICT"): AppError {
  return new AppError(code, message, 409);
}

export function badRequest(message: string, code = "BAD_REQUEST"): AppError {
  return new AppError(code, message, 400);
}

export function tooManyRequests(message = "Rate limit exceeded", _retryAfter?: number): AppError {
  return new AppError("RATE_LIMIT_EXCEEDED", message, 429);
}
