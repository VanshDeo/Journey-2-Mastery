import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";

/**
 * Validation middleware wrapper.
 * Uses @hono/zod-validator with a custom error hook that returns
 * our standard error envelope instead of the default Hono error.
 */
export function validate<T extends keyof ValidationTargets>(
  target: T,
  schema: ZodSchema
) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const firstError = result.error.issues[0];
      const message = firstError
        ? `${firstError.path.join(".")}: ${firstError.message}`
        : "Invalid request data";

      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
          },
        },
        400
      );
    }
  });
}
