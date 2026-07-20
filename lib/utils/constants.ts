import type { Role, Rank, SubmissionStatus } from "../db/schema";

// ──────────────────────────────────────────────
// Role & Rank Constants
// ──────────────────────────────────────────────

export const ROLE_ADMIN: Role = "admin";
export const ROLE_JUDGE: Role = "judge";
export const ROLE_USER: Role = "user";

export const RANK_RONIN: Rank = "Ronin";
export const RANK_KENSHI: Rank = "Kenshi";
export const RANK_SAMURAI: Rank = "Samurai";
export const RANK_SHOGUN: Rank = "Shogun";

/**
 * Rank hierarchy (ordered lowest → highest).
 * A user can access tasks at their rank level or below.
 */
export const RANK_ORDER: Rank[] = ["Ronin", "Kenshi", "Samurai", "Shogun"];

/**
 * Check if a user's rank allows access to a required rank level.
 */
export function isRankSufficient(userRank: Rank, requiredRank: Rank): boolean {
  return RANK_ORDER.indexOf(userRank) >= RANK_ORDER.indexOf(requiredRank);
}

// ──────────────────────────────────────────────
// Submission Statuses
// ──────────────────────────────────────────────

export const STATUS_PENDING: SubmissionStatus = "pending";
export const STATUS_IN_REVIEW: SubmissionStatus = "in_review";
export const STATUS_APPROVED: SubmissionStatus = "approved";
export const STATUS_REJECTED: SubmissionStatus = "rejected";

// ──────────────────────────────────────────────
// Notification Types
// ──────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  SUBMISSION_ASSIGNED: "submission_assigned",
  SUBMISSION_APPROVED: "submission_approved",
  SUBMISSION_REJECTED: "submission_rejected",
  RANK_UP: "rank_up",
  NEW_TASK: "new_task",
  REVIEW_COMMENT: "review_comment",
  BADGE_EARNED: "badge_earned",
  SYSTEM: "system",
} as const;

// ──────────────────────────────────────────────
// Audit Actions
// ──────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  USER_ROLE_CHANGED: "user_role_changed",
  USER_DELETED: "user_deleted",
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated",
  TASK_DELETED: "task_deleted",
  SUBMISSION_ASSIGNED: "submission_assigned",
  SUBMISSION_REASSIGNED: "submission_reassigned",
  REVIEW_OVERRIDDEN: "review_overridden",
  SCORE_OVERRIDDEN: "score_overridden",
  LEADERBOARD_RECALCULATED: "leaderboard_recalculated",
  POST_CREATED: "post_created",
  POST_UPDATED: "post_updated",
  POST_DELETED: "post_deleted",
} as const;

// ──────────────────────────────────────────────
// Cache Keys
// ──────────────────────────────────────────────

export const CACHE_KEYS = {
  userRepos: (userId: string) => `user:${userId}:repos`,
  leaderboard: "leaderboard",
  adminDashboard: "admin:dashboard",
  jwtBlacklist: (jti: string) => `jwt:blacklist:${jti}`,
} as const;

// ──────────────────────────────────────────────
// Cache TTLs (seconds)
// ──────────────────────────────────────────────

export const CACHE_TTL = {
  USER_REPOS: 180,       // 3 minutes
  LEADERBOARD: 60,       // 1 minute
  ADMIN_DASHBOARD: 120,  // 2 minutes
} as const;
