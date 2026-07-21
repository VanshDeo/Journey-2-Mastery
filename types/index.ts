import type { Role, Rank } from "../lib/db/schema";

/**
 * JWT payload stored in the token.
 * Minimal claims — no sensitive data.
 */
export interface JWTPayload {
  sub: string;          // user id
  role: Role;
  rank: Rank;
  username: string;
  jti: string;          // JWT ID (for blacklisting)
  iat: number;
  exp: number;
}

/**
 * Authenticated user attached to the Hono context via auth middleware.
 */
export interface AuthUser {
  id: string;
  role: Role;
  rank: Rank;
  username: string;
  jti: string;
}

/**
 * Hono environment type bindings.
 * Used throughout the app for type-safe context access.
 */
export type AppEnv = {
  Variables: {
    user: AuthUser;
    requestId: string;
  };
};

/**
 * GitHub user profile returned from the GitHub API.
 */
export interface GitHubUserProfile {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

/**
 * GitHub repository info returned from the GitHub API.
 */
export interface GitHubRepo {
  repoId: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  updatedAt: string;
}
