import { Hono } from "hono";
import type { AppEnv } from "../../types/index.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import * as leaderboardController from "../../controllers/leaderboard.controller.js";

const leaderboard = new Hono<AppEnv>();

// Leaderboard is visible to all authenticated roles
leaderboard.use("/*", authMiddleware);
leaderboard.get("/", leaderboardController.getLeaderboard);

export default leaderboard;
