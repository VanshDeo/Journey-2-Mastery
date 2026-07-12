import { Hono } from "hono";
import type { AppEnv } from "../../types/index.js";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import judgeRoutes from "./judge.routes.js";
import adminRoutes from "./admin.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js";
import postRoutes from "./post.routes.js";
import notificationRoutes from "./notification.routes.js";
import commentRoutes from "./comment.routes.js";

/**
 * V1 API router.
 * Mounts all route groups under /api/v1.
 */
const v1 = new Hono<AppEnv>();

// Infrastructure
v1.route("/health", healthRoutes);

// Auth (GitHub OAuth, JWT, profile completion)
v1.route("/auth", authRoutes);

// User flow (dashboard, tasks, submissions, GitHub repos, profile)
v1.route("/user", userRoutes);

// Judge (dashboard, review queue, reviews, workload)
v1.route("/judge", judgeRoutes);

// Admin (full management: users, tasks, submissions, reviews, judges, posts, audit)
v1.route("/admin", adminRoutes);

// Public endpoints (all authenticated roles)
v1.route("/leaderboard", leaderboardRoutes);
v1.route("/posts", postRoutes);
v1.route("/notifications", notificationRoutes);
v1.route("/submissions", commentRoutes); // /submissions/:id/comments

export default v1;
