import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { users, sessions } from "../db/schema";
import { env } from "../config/env";
import { redis } from "../config/redis";
import { githubConfig } from "../config/github";
import { logger } from "../config/logger";
import { encrypt, decrypt } from "../utils/encryption";
import { CACHE_KEYS } from "../utils/constants";
import { conflict, unauthorized, notFound, badRequest } from "../utils/apiError";
import type { GitHubUserProfile } from "../types/index";
import type { CompleteProfileInput } from "../validators/auth.validator";

// ──────────────────────────────────────────────
// GitHub OAuth
// ──────────────────────────────────────────────

/**
 * Build the GitHub OAuth authorization URL.
 * Includes a CSRF state parameter.
 */
export function getGitHubAuthUrl(): { url: string; state: string } {
  const state = uuidv4();
  const params = new URLSearchParams({
    client_id: githubConfig.clientId,
    redirect_uri: githubConfig.callbackUrl,
    scope: githubConfig.scopes.join(" "),
    state,
  });

  return {
    url: `${githubConfig.authorizeUrl}?${params.toString()}`,
    state,
  };
}

/**
 * Exchange a GitHub OAuth code for an access token.
 */
export async function exchangeGitHubCode(code: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    githubConfig.requestTimeoutMs
  );

  try {
    const response = await fetch(githubConfig.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
        redirect_uri: githubConfig.callbackUrl,
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (data.error || !data.access_token) {
      logger.error({ error: data.error, description: data.error_description }, "GitHub token exchange failed");
      throw badRequest(
        data.error_description || "Failed to exchange GitHub code",
        "GITHUB_AUTH_FAILED"
      );
    }

    return data.access_token;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw badRequest("GitHub API request timed out", "GITHUB_TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch the GitHub user profile using an access token.
 */
export async function fetchGitHubProfile(
  accessToken: string
): Promise<GitHubUserProfile> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    githubConfig.requestTimeoutMs
  );

  try {
    const response = await fetch(`${githubConfig.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "J2M-Backend",
      },
      signal: controller.signal,
    });

    // Handle GitHub rate limiting
    const remaining = response.headers.get("X-RateLimit-Remaining");
    if (response.status === 403 && remaining === "0") {
      const resetTime = response.headers.get("X-RateLimit-Reset");
      throw badRequest(
        `GitHub API rate limit exceeded. Resets at ${resetTime ? new Date(parseInt(resetTime) * 1000).toISOString() : "unknown"}`,
        "GITHUB_RATE_LIMIT"
      );
    }

    if (!response.ok) {
      throw badRequest("Failed to fetch GitHub profile", "GITHUB_API_ERROR");
    }

    const profile = (await response.json()) as GitHubUserProfile;

    // Fetch email if not public
    if (!profile.email) {
      const emailResponse = await fetch(`${githubConfig.apiUrl}/user/emails`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "J2M-Backend",
        },
      });

      if (emailResponse.ok) {
        const emails = (await emailResponse.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        if (primaryEmail) {
          profile.email = primaryEmail.email;
        }
      }
    }

    return profile;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw badRequest("GitHub API request timed out", "GITHUB_TIMEOUT");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Find or create a user from a GitHub profile.
 * On first login, creates a new user with role='user', isProfileComplete=false.
 */
export async function findOrCreateUser(
  profile: GitHubUserProfile,
  githubAccessToken: string
) {
  const encryptedToken = encrypt(githubAccessToken);

  // Try to find existing user
  const existingUser = await db.query.users.findFirst({
    where: eq(users.githubId, String(profile.id)),
  });

  if (existingUser) {
    // Update the access token on each login
    const [updatedUser] = await db
      .update(users)
      .set({ githubAccessToken: encryptedToken })
      .where(eq(users.id, existingUser.id))
      .returning();

    if (updatedUser) {
      updatedUser.role = updatedUser.role.trim() as 'user' | 'judge' | 'admin';
      updatedUser.rank = updatedUser.rank.trim() as 'Ronin' | 'Kenshi' | 'Samurai' | 'Shogun';
    }
    return updatedUser!;
  }

  // Create new user
  const [newUser] = await db
    .insert(users)
    .values({
      githubId: String(profile.id),
      username: profile.login,
      email: profile.email,
      avatarUrl: profile.avatar_url,
      fullName: profile.name,
      role: "user",
      rank: "Ronin",
      isProfileComplete: false,
      githubAccessToken: encryptedToken,
    })
    .returning();

  logger.info(
    { userId: newUser!.id, username: profile.login },
    "New user created via GitHub OAuth"
  );

  if (newUser) {
    newUser.role = newUser.role.trim() as 'user' | 'judge' | 'admin';
    newUser.rank = newUser.rank.trim() as 'Ronin' | 'Kenshi' | 'Samurai' | 'Shogun';
  }
  return newUser!;
}

// ──────────────────────────────────────────────
// JWT Token Management
// ──────────────────────────────────────────────

/**
 * Issue access + refresh JWT tokens for a user and save session.
 */
export async function issueTokens(
  user: { id: string; role: string; rank: string; username: string },
  userAgent?: string,
  ipAddress?: string
) {
  const jti = uuidv4();
  const refreshJti = uuidv4();

  const accessToken = jwt.sign(
    {
      sub: user.id,
      role: user.role?.trim(),
      rank: user.rank?.trim(),
      username: user.username,
      jti,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { sub: user.id, jti: refreshJti, type: "refresh" },
    env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY } as jwt.SignOptions
  );

  // Parse refresh token expiry (env.JWT_REFRESH_EXPIRY might be something like "7d")
  // For simplicity, let's just use 7 days from now as expiresAt
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Save session in DB (using refreshJti as ID since it represents the session refresh token)
  await db.insert(sessions).values({
    id: refreshJti,
    userId: user.id,
    userAgent: userAgent || "Unknown device",
    ipAddress: ipAddress || "Unknown IP",
    expiresAt,
  });

  return { accessToken, refreshToken };
}

/**
 * Refresh access token using a valid refresh token.
 */
export async function refreshAccessToken(refreshToken: string) {
  let payload: { sub: string; jti: string; type: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_SECRET) as typeof payload;
  } catch {
    throw unauthorized("Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw unauthorized("Invalid token type");
  }

  // Check if refresh token is blacklisted
  const isBlacklisted = await redis.get(
    CACHE_KEYS.jwtBlacklist(payload.jti)
  );
  if (isBlacklisted) {
    throw unauthorized("Refresh token has been revoked");
  }

  // Fetch the user to get latest role/rank
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.sub),
  });

  if (!user) {
    throw notFound("User");
  }

  if (!user.isActive) {
    throw unauthorized("Account has been deactivated");
  }

  // Blacklist the old refresh token (rotation)
  await redis.set(CACHE_KEYS.jwtBlacklist(payload.jti), "1", "EX", 60 * 60 * 24 * 7);

  // Issue new tokens
  return await issueTokens(user);
}

/**
 * Logout — blacklist the current JWT.
 */
export async function logout(jti: string, exp: number) {
  // Blacklist until the token's original expiry
  const ttl = Math.max(exp - Math.floor(Date.now() / 1000), 0);
  if (ttl > 0) {
    await redis.set(CACHE_KEYS.jwtBlacklist(jti), "1", "EX", ttl);
  }
}

// ──────────────────────────────────────────────
// Profile Completion
// ──────────────────────────────────────────────

/**
 * One-time profile completion.
 * Returns 409 if profile is already complete (idempotency guard).
 */
export async function completeProfile(
  userId: string,
  data: CompleteProfileInput
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw notFound("User", userId);
  }

  if (user.isProfileComplete) {
    throw conflict(
      "Profile has already been completed",
      "PROFILE_ALREADY_COMPLETE"
    );
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      fullName: data.fullName,
      collegeName: data.collegeName,
      branch: data.branch,
      year: data.year,
      phone: data.phone,
      bio: data.bio,
      isProfileComplete: true,
    })
    .where(eq(users.id, userId))
    .returning();

  if (updatedUser) {
    updatedUser.role = updatedUser.role.trim() as 'user' | 'judge' | 'admin';
    updatedUser.rank = updatedUser.rank.trim() as 'Ronin' | 'Kenshi' | 'Samurai' | 'Shogun';
  }
  return updatedUser!;
}

/**
 * Get the current user's full profile.
 */
export async function getCurrentUser(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      githubAccessToken: false, // Never expose
    },
    with: {
      team: true,
    },
  });

  if (!user) {
    throw notFound("User", userId);
  }
  user.role = user.role.trim() as 'user' | 'judge' | 'admin';
  user.rank = user.rank.trim() as 'Ronin' | 'Kenshi' | 'Samurai' | 'Shogun';
  return user;
}

// ──────────────────────────────────────────────
// Sessions Management
// ──────────────────────────────────────────────

/**
 * Get active sessions for a user
 */
export async function getSessions(userId: string, currentJti: string) {
  const userSessions = await db.query.sessions.findMany({
    where: eq(sessions.userId, userId),
    orderBy: (sessions, { desc }) => [desc(sessions.lastUsedAt)],
  });

  return userSessions.map(session => ({
    id: session.id,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    lastUsedAt: session.lastUsedAt,
    isCurrent: session.id === currentJti,
  }));
}

/**
 * Revoke a specific session
 */
export async function revokeSession(userId: string, sessionId: string) {
  // We can just delete it from the DB. 
  // Technically we should also add it to Redis blacklist, but the JTI we have is the refresh token JTI.
  const [deletedSession] = await db
    .delete(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .returning();

  if (deletedSession) {
    // Blacklist the refresh token
    const ttl = Math.max(deletedSession.expiresAt.getTime() - Date.now(), 0) / 1000;
    if (ttl > 0) {
      await redis.set(CACHE_KEYS.jwtBlacklist(deletedSession.id), "1", "EX", Math.ceil(ttl));
    }
  } else {
    throw notFound("Session", sessionId);
  }
}

/**
 * Decrypt a user's stored GitHub access token (server-side only).
 */
export function decryptGitHubToken(encryptedToken: string): string {
  return decrypt(encryptedToken);
}
