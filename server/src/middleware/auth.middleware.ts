import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import type { AppEnv, JWTPayload, AuthUser } from "../types/index";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { CACHE_KEYS } from "../utils/constants";
import { unauthorized } from "../utils/apiError";

/**
 * Authentication middleware.
 * Verifies JWT from Authorization: Bearer <token> header.
 * Checks JWT blacklist in Redis (for logout/revocation).
 * Attaches the authenticated user to the Hono context.
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw unauthorized("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  let payload: JWTPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw unauthorized("Token has expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw unauthorized("Invalid token");
    }
    throw unauthorized("Authentication failed");
  }

  // Check if the token has been blacklisted (logged out)
  const isBlacklisted = await redis.get(CACHE_KEYS.jwtBlacklist(payload.jti));
  if (isBlacklisted) {
    throw unauthorized("Token has been revoked");
  }

  // Attach the user to the context
  const user: AuthUser = {
    id: payload.sub,
    role: payload.role,
    rank: payload.rank,
    username: payload.username,
    jti: payload.jti,
  };

  c.set("user", user);

  await next();
});
