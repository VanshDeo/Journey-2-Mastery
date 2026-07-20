import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Standard success response envelope.
 * Every endpoint returns this shape for consistency.
 */
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Standard error response envelope.
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface PaginationMeta {
  cursor?: string | null;
  nextCursor?: string | null;
  limit: number;
  total?: number;
}

/**
 * Send a success response with consistent envelope.
 */
export function success<T>(c: Context, data: T, meta?: PaginationMeta, status: ContentfulStatusCode = 200) {
  const body: SuccessResponse<T> = { success: true, data };
  if (meta) {
    body.meta = meta;
  }
  return c.json(body, status);
}

/**
 * Send a 201 Created response.
 */
export function created<T>(c: Context, data: T) {
  return success(c, data, undefined, 201);
}

/**
 * Send a 202 Accepted response (async jobs).
 */
export function accepted<T>(c: Context, data: T) {
  return success(c, data, undefined, 202);
}

/**
 * Send an error response with consistent envelope.
 */
export function error(
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode = 400
) {
  const body: ErrorResponse = {
    success: false,
    error: { code, message },
  };
  return c.json(body, status);
}
