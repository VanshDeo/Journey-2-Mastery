import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { redis } from "../config/redis.js";
import { githubConfig } from "../config/github.js";
import { logger } from "../config/logger.js";
import { decrypt } from "../utils/encryption.js";
import { CACHE_KEYS, CACHE_TTL } from "../utils/constants.js";
import { notFound, badRequest } from "../utils/apiError.js";
import type { GitHubRepo } from "../types/index.js";

/**
 * Fetch the authenticated user's public GitHub repos.
 * Uses the stored encrypted GitHub access token.
 * Results are cached in Redis for 2-5 min to stay under GitHub's rate limit.
 */
export async function getUserRepos(userId: string): Promise<GitHubRepo[]> {
  // Check cache first
  const cacheKey = CACHE_KEYS.userRepos(userId);
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as GitHubRepo[];
  }

  // Fetch user to get encrypted token
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { githubAccessToken: true },
  });

  if (!user?.githubAccessToken) {
    throw notFound("GitHub access token. Please re-authenticate.");
  }

  const accessToken = decrypt(user.githubAccessToken);

  // Fetch repos from GitHub API (paginated, all pages)
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      githubConfig.requestTimeoutMs
    );

    try {
      const response = await fetch(
        `${githubConfig.apiUrl}/user/repos?visibility=public&sort=updated&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "J2M-Backend",
          },
          signal: controller.signal,
        }
      );

      // Handle rate limiting gracefully
      const remaining = response.headers.get("X-RateLimit-Remaining");
      if (response.status === 403 && remaining === "0") {
        const resetTime = response.headers.get("X-RateLimit-Reset");
        logger.warn(
          { userId, resetTime },
          "GitHub API rate limit hit during repo fetch"
        );
        throw badRequest(
          "GitHub API rate limit reached. Please try again in a few minutes.",
          "GITHUB_RATE_LIMIT"
        );
      }

      if (!response.ok) {
        logger.error(
          { userId, status: response.status },
          "GitHub API error fetching repos"
        );
        throw badRequest(
          "Failed to fetch repositories from GitHub",
          "GITHUB_API_ERROR"
        );
      }

      const data = (await response.json()) as Array<{
        id: number;
        name: string;
        full_name: string;
        html_url: string;
        description: string | null;
        updated_at: string;
        private: boolean;
      }>;

      for (const repo of data) {
        if (!repo.private) {
          repos.push({
            repoId: String(repo.id),
            name: repo.name,
            fullName: repo.full_name,
            htmlUrl: repo.html_url,
            description: repo.description,
            updatedAt: repo.updated_at,
          });
        }
      }

      // No more pages
      if (data.length < perPage) break;
      page++;

      // Safety limit — don't fetch more than 10 pages (1000 repos)
      if (page > 10) break;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw badRequest(
          "GitHub API request timed out",
          "GITHUB_TIMEOUT"
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Cache the result
  await redis.set(cacheKey, JSON.stringify(repos), "EX", CACHE_TTL.USER_REPOS);

  return repos;
}
