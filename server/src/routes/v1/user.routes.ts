import { Hono } from "hono";
import type { AppEnv } from "../../types/index";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createSubmissionSchema,
  updateSubmissionSchema,
  updateProfileSchema,
  taskFilterSchema,
} from "../../validators/user.validator";
import * as userController from "../../controllers/user.controller";

const user = new Hono<AppEnv>();

// All user routes require authentication + user/judge/admin role
user.use("/*", authMiddleware, requireRole(["user", "judge", "admin"]));

// ── Dashboard ──
user.get("/dashboard", userController.getDashboard);

// ── Tasks ──
// NOTE: /tasks/completed and /tasks/pending must be before /tasks/:taskId
user.get("/tasks/completed", userController.getCompletedTasks);
user.get("/tasks/pending", userController.getPendingTasks);
user.get("/tasks", validate("query", taskFilterSchema), userController.getTasks);
user.get("/tasks/:taskId", userController.getTask);

// ── GitHub Repos ──
user.get("/github/repos", userController.getGitHubRepos);

// ── Submissions ──
user.post(
  "/submissions",
  validate("json", createSubmissionSchema),
  userController.createSubmission
);
user.get("/submissions", userController.getSubmissions);
user.get("/submissions/:id", userController.getSubmission);
user.patch(
  "/submissions/:id",
  validate("json", updateSubmissionSchema),
  userController.updateSubmission
);
user.delete("/submissions/:id", userController.deleteSubmission);

// ── Profile ──
user.get("/profile", userController.getProfile);
user.patch(
  "/profile",
  validate("json", updateProfileSchema),
  userController.updateProfile
);

// ── Settings ──
user.get("/settings", userController.getSettings);
user.patch("/settings", userController.updateSettings);

// ── Account ──
user.delete("/account", userController.deleteAccount);

export default user;

