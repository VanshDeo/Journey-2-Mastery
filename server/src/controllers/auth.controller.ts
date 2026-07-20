import type { Context } from "hono";
import type { AppEnv } from "../types/index";
import * as authService from "../services/auth.service";
import { success, created } from "../utils/apiResponse";
import { env } from "../config/env";
import type { CompleteProfileInput, RefreshTokenInput } from "../validators/auth.validator";


/**
 * GET /api/v1/auth/github
 * Redirect user to GitHub OAuth consent screen.
 */
export async function githubRedirect(c: Context<AppEnv>) {
  const { url, state } = authService.getGitHubAuthUrl();

  // Store state in a short-lived cookie for CSRF verification
  c.header(
    "Set-Cookie",
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  return c.redirect(url);
}

/**
 * GET /api/v1/auth/github/callback
 * GitHub redirects here with code + state.
 * Exchanges code for token, fetches profile, creates/finds user, issues JWT.
 */
export async function githubCallback(c: Context<AppEnv>) {
  try {
    const code = c.req.query("code");

    if (!code) {
      return c.json(
        {
          success: false,
          error: { code: "MISSING_CODE", message: "Missing authorization code" },
        },
        400
      );
    }

    // Exchange code for GitHub access token
    const githubAccessToken = await authService.exchangeGitHubCode(code);

    // Fetch GitHub profile
    const profile = await authService.fetchGitHubProfile(githubAccessToken);

    // Find or create user
    const user = await authService.findOrCreateUser(profile, githubAccessToken);

    // Issue JWT tokens
    const userAgent = c.req.header("user-agent");
    const ipAddress = c.req.header("x-forwarded-for") || "unknown";
    
    const tokens = await authService.issueTokens(user, userAgent, ipAddress);

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set("accessToken", tokens.accessToken);
    redirectUrl.searchParams.set("refreshToken", tokens.refreshToken);

    return c.redirect(redirectUrl.toString());
  } catch (err: unknown) {
    console.error("❌ githubCallback error:", err);
    if (err instanceof Error) {
      console.error("Stack trace:", err.stack);
    }
    throw err;
  }
}

/**
 * GET /api/v1/auth/me
 * Get the currently authenticated user.
 */
export async function getMe(c: Context<AppEnv>) {
  const authUser = c.get("user");
  const user = await authService.getCurrentUser(authUser.id);

  return success(c, {
    user: {
      ...user,
      isProfileComplete: user.isProfileComplete,
    },
  });
}

/**
 * POST /api/v1/auth/refresh
 * Refresh JWT tokens using a refresh token.
 */
export async function refreshToken(c: Context<AppEnv>) {
  const body = c.req.valid("json" as never) as RefreshTokenInput;
  const tokens = await authService.refreshAccessToken(body.refreshToken);

  return success(c, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

/**
 * POST /api/v1/auth/logout
 * Invalidate the current JWT.
 */
export async function logout(c: Context<AppEnv>) {
  const user = c.get("user");

  // Decode the token to get expiry
  const authHeader = c.req.header("Authorization")!;
  const token = authHeader.slice(7);
  const decoded = JSON.parse(
    Buffer.from(token.split(".")[1]!, "base64").toString()
  ) as { exp: number };

  await authService.logout(user.jti, decoded.exp);

  return success(c, { message: "Logged out successfully" });
}

/**
 * GET /api/v1/auth/profile-status
 * Check if the user's profile setup is still pending.
 */
export async function getProfileStatus(c: Context<AppEnv>) {
  const authUser = c.get("user");
  const user = await authService.getCurrentUser(authUser.id);

  return success(c, {
    isProfileComplete: user.isProfileComplete,
  });
}

/**
 * POST /api/v1/auth/complete-profile
 * One-time profile completion. Returns 409 on repeat.
 */
export async function completeProfile(c: Context<AppEnv>) {
  const authUser = c.get("user");
  const body = c.req.valid("json" as never) as CompleteProfileInput;

  const user = await authService.completeProfile(authUser.id, body);

  // Issue new tokens with updated profile data
  const userAgent = c.req.header("user-agent");
  const ipAddress = c.req.header("x-forwarded-for") || "unknown";
  
  const tokens = await authService.issueTokens(user, userAgent, ipAddress);

  return created(c, {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      isProfileComplete: user.isProfileComplete,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

/**
 * GET /api/v1/auth/sessions
 * Get active sessions for the current user.
 */
export async function getSessions(c: Context<AppEnv>) {
  const user = c.get("user");
  // The current session ID (jti) from the JWT
  const currentJti = user.jti;
  const sessions = await authService.getSessions(user.id, currentJti);
  return success(c, sessions);
}

/**
 * DELETE /api/v1/auth/sessions/:id
 * Revoke a specific session.
 */
export async function revokeSession(c: Context<AppEnv>) {
  const user = c.get("user");
  const sessionId = c.req.param("id");
  await authService.revokeSession(user.id, sessionId!);
  return success(c, { message: "Session revoked successfully" });
}


