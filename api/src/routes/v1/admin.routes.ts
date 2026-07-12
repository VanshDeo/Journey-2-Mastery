import { Hono } from "hono";
import type { AppEnv } from "../../types/index.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateUserSchema,
  changeRoleSchema,
  manualAssignSchema,
  overrideReviewSchema,
  createPostSchema,
  updatePostSchema,
} from "../../validators/admin.validator.js";
import * as adminController from "../../controllers/admin.controller.js";

const admin = new Hono<AppEnv>();

// All admin routes require auth + admin role
admin.use("/*", authMiddleware, requireRole(["admin"]));

// ── Dashboard ──
admin.get("/dashboard", adminController.getDashboard);
admin.get("/dashboard/activity", adminController.getActivityFeed);

// ── User Management ──
admin.get("/users", adminController.getUsers);
admin.get("/users/:id", adminController.getUser);
admin.patch("/users/:id", validate("json", updateUserSchema), adminController.updateUser);
admin.patch("/users/:id/role", validate("json", changeRoleSchema), adminController.changeUserRole);
admin.delete("/users/:id", adminController.deleteUser);

// ── Task Management ──
admin.post("/tasks", validate("json", createTaskSchema), adminController.createTask);
admin.get("/tasks", adminController.getTasks);
admin.patch("/tasks/:id", validate("json", updateTaskSchema), adminController.updateTask);
admin.delete("/tasks/:id", adminController.deleteTask);

// ── Submission & Review Oversight ──
admin.get("/submissions", adminController.getSubmissions);
admin.get("/submissions/:id", adminController.getSubmission);
admin.post("/submissions/:id/assign", validate("json", manualAssignSchema), adminController.manualAssign);
admin.get("/assignment/unassigned", adminController.getUnassigned);
admin.post("/assignment/reassign/:submissionId", adminController.reassign);
admin.patch("/reviews/:id/override", validate("json", overrideReviewSchema), adminController.overrideReview);
admin.get("/reviews", adminController.getAllReviews);

// ── Leaderboard ──
admin.get("/leaderboard", adminController.recalculateLeaderboard); // GET for viewing
admin.post("/leaderboard/recalculate", adminController.recalculateLeaderboard); // POST returns 202

// ── Judge Management ──
admin.get("/judges", adminController.getJudges);

// ── Community Posts (Admin CRUD) ──
admin.post("/posts/upload-image", adminController.uploadImage);
admin.post("/posts", validate("json", createPostSchema), adminController.createPost);
admin.get("/posts", adminController.getAdminPosts);
admin.patch("/posts/:id", validate("json", updatePostSchema), adminController.updatePost);
admin.delete("/posts/:id", adminController.deletePost);

// ── Audit Log ──
admin.get("/audit-log", adminController.getAuditLog);

export default admin;
