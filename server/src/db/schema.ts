import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ──────────────────────────────────────────────
// Enums as Postgres check constraints via text + Zod
// ──────────────────────────────────────────────

export const ROLES = ["admin", "judge", "user"] as const;
export type Role = (typeof ROLES)[number];

export const RANKS = ["Ronin", "Kenshi", "Samurai", "Shogun"] as const;
export type Rank = (typeof RANKS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const SUBMISSION_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "rejected",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

// ──────────────────────────────────────────────
// Tables
// ──────────────────────────────────────────────

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    joinCode: text("join_code").notNull(),
    status: text("status").notNull().default("incomplete"), // "incomplete" | "active"
    score: integer("score").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("teams_join_code_idx").on(table.joinCode),
  ]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    githubId: text("github_id").notNull(),
    username: text("username").notNull(),
    email: text("email"),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ROLES }).notNull().default("user"),
    rank: text("rank", { enum: RANKS }).notNull().default("Ronin"),
    fullName: text("full_name"),
    collegeName: text("college_name"),
    branch: text("branch"),
    year: text("year"),
    phone: text("phone"),
    bio: text("bio"),
    isProfileComplete: boolean("is_profile_complete").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    score: integer("score").notNull().default(0),
    githubAccessToken: text("github_access_token"), // Encrypted at rest
    currentTeamId: uuid("current_team_id").references(() => teams.id, { onDelete: "set null" }),
    teamRole: text("team_role"), // 'leader' | 'member'
    teamJoinedAt: timestamp("team_joined_at", { withTimezone: true }),
    settings: jsonb("settings").default({
      emailNotifications: true,
      submissionUpdates: true,
      reviewNotifications: true,
      leaderboardUpdates: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_github_id_idx").on(table.githubId),
    index("users_role_idx").on(table.role),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    difficulty: text("difficulty", { enum: DIFFICULTIES }).notNull(),
    rankRequired: text("rank_required", { enum: RANKS })
      .notNull()
      .default("Ronin"),
    points: integer("points").notNull().default(0),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("tasks_category_idx").on(table.category),
    index("tasks_difficulty_idx").on(table.difficulty),
    index("tasks_rank_required_idx").on(table.rankRequired),
  ]
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
    repoId: text("repo_id").notNull(),
    repoUrl: text("repo_url").notNull(),
    repoName: text("repo_name").notNull(),
    status: text("status", { enum: SUBMISSION_STATUSES })
      .notNull()
      .default("pending"),
    assignedJudgeId: uuid("assigned_judge_id").references(() => users.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    autoAssigned: boolean("auto_assigned").notNull().default(false),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("submissions_user_id_idx").on(table.userId),
    index("submissions_task_id_idx").on(table.taskId),
    index("submissions_status_idx").on(table.status),
    index("submissions_assigned_judge_id_idx").on(table.assignedJudgeId),
    index("submissions_status_submitted_at_idx").on(
      table.status,
      table.submittedAt
    ),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id),
    judgeId: uuid("judge_id")
      .notNull()
      .references(() => users.id),
    scoreBreakdown: jsonb("score_breakdown"),
    totalScore: integer("total_score").notNull().default(0),
    feedback: text("feedback"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("reviews_submission_id_idx").on(table.submissionId),
    index("reviews_judge_id_idx").on(table.judgeId),
  ]
);

export const communityPosts = pgTable(
  "community_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    posterImageUrl: text("poster_image_url"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("community_posts_is_published_idx").on(table.isPublished),
    index("community_posts_created_at_idx").on(table.createdAt),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    relatedEntityId: uuid("related_entity_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_id_is_read_idx").on(table.userId, table.isRead),
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("comments_submission_id_idx").on(table.submissionId)]
);

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  criteria: jsonb("criteria"),
});

export const userBadges = pgTable(
  "user_badges",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id),
    earnedAt: timestamp("earned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.badgeId] })]
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_actor_id_idx").on(table.actorId),
    index("audit_log_created_at_idx").on(table.createdAt),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // Refresh token JTI
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
);


// ──────────────────────────────────────────────
// Relations (for Drizzle relational queries)
// ──────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  tasks: many(tasks),
  submissions: many(submissions, { relationName: "userSubmissions" }),
  assignedSubmissions: many(submissions, {
    relationName: "judgeAssignments",
  }),
  reviews: many(reviews),
  communityPosts: many(communityPosts),
  notifications: many(notifications),
  comments: many(comments),
  userBadges: many(userBadges),
  auditLogs: many(auditLog),
  sessions: many(sessions),
  team: one(teams, {
    fields: [users.currentTeamId],
    references: [teams.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(users),
  submissions: many(submissions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  task: one(tasks, {
    fields: [submissions.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
    relationName: "userSubmissions",
  }),
  assignedJudge: one(users, {
    fields: [submissions.assignedJudgeId],
    references: [users.id],
    relationName: "judgeAssignments",
  }),
  review: one(reviews),
  comments: many(comments),
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  submission: one(submissions, {
    fields: [reviews.submissionId],
    references: [submissions.id],
  }),
  judge: one(users, {
    fields: [reviews.judgeId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(
  communityPosts,
  ({ one }) => ({
    creator: one(users, {
      fields: [communityPosts.createdBy],
      references: [users.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  submission: one(submissions, {
    fields: [comments.submissionId],
    references: [submissions.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actorId],
    references: [users.id],
  }),
}));
