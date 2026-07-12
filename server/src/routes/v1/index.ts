import { Hono } from "hono";
import type { AppEnv } from "../../types/index";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import teamRoutes from "./team.routes";
import judgeRoutes from "./judge.routes";
import adminRoutes from "./admin.routes";
import leaderboardRoutes from "./leaderboard.routes";
import postRoutes from "./post.routes";
import notificationRoutes from "./notification.routes";
import commentRoutes from "./comment.routes";

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

// Team flow
v1.route("/teams", teamRoutes);

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
