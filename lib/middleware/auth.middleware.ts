import jwt from "jsonwebtoken";
import type { JWTPayload, AuthUser } from "@/types";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { CACHE_KEYS } from "../utils/constants";
import { unauthorized } from "../utils/apiError";

export async function requireAuth(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get("Authorization");
  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = Object.fromEntries(cookieHeader.split(";").map(c => c.trim().split("=")));
      if (cookies.accessToken) {
        token = cookies.accessToken;
      }
    }
  }

  if (!token) {
    throw unauthorized("Missing or invalid Authorization header or cookie");
  }

  let payload: JWTPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw unauthorized("Token has expired");
    }
    throw unauthorized("Invalid token");
  }

  const isBlacklisted = await redis.get(CACHE_KEYS.jwtBlacklist(payload.jti));
  if (isBlacklisted) {
    throw unauthorized("Token has been revoked");
  }

  return {
    id: payload.sub,
    role: payload.role,
    rank: payload.rank,
    username: payload.username,
    jti: payload.jti,
  };
}
