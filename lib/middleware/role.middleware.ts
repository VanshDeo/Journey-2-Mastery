import type { Role } from "../db/schema";
import { forbidden } from "../utils/apiError";
import type { AuthUser } from "@/types";

export function requireRole(user: AuthUser, allowedRoles: Role[]) {
  if (!allowedRoles.includes(user.role)) {
    throw forbidden(`Access denied. Requires one of: ${allowedRoles.join(", ")}`);
  }
}
