import { env } from "../config/env";

/**
 * GitHub OAuth configuration.
 * Used by auth.service.ts to handle the OAuth flow.
 */
export const githubConfig = {
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  callbackUrl: env.GITHUB_CALLBACK_URL,

  /** GitHub OAuth authorization endpoint */
  authorizeUrl: "https://github.com/login/oauth/authorize",

  /** GitHub OAuth token exchange endpoint */
  tokenUrl: "https://github.com/login/oauth/access_token",

  /** GitHub API base URL */
  apiUrl: "https://api.github.com",

  /** Scopes requested during OAuth consent */
  scopes: ["read:user", "user:email", "public_repo"],

  /** Timeout for outbound GitHub API calls (ms) */
  requestTimeoutMs: 10_000,
} as const;
