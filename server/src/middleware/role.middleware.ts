import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types/index";
import type { Role } from "../db/schema";
import { forbidden } from "../utils/apiError";

/**
 * Role-based authorization middleware factory.
 * Checks if the authenticated user's role is in the allowed roles list.
 *
 * Must be used AFTER authMiddleware — requires c.get('user') to be set.
 *
 * @example
 *   app.use('/api/v1/admin/*', authMiddleware, requireRole(['admin']));
 *   app.use('/api/v1/judge/*', authMiddleware, requireRole(['judge', 'admin']));
 */
export function requireRole(allowedRoles: Role[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw forbidden("Authentication required before authorization");
    }

    if (!allowedRoles.includes(user.role)) {
      throw forbidden(
        `Role '${user.role}' is not authorized for this resource. Required: ${allowedRoles.join(", ")}`
      );
    }

    await next();
  });
}
