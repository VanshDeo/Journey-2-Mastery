import type { Context } from "hono";
import type { AppEnv } from "../types/index.js";
import * as adminService from "../services/admin.service.js";
import { success, created, accepted } from "../utils/apiResponse.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateUserInput,
  ChangeRoleInput,
  ManualAssignInput,
  OverrideReviewInput,
  CreatePostInput,
  UpdatePostInput,
} from "../validators/admin.validator.js";
import { uploadFile } from "../services/upload.service.js";

// ── Dashboard ──
export async function getDashboard(c: Context<AppEnv>) {
  const data = await adminService.getDashboard();
  return success(c, data);
}

export async function getActivityFeed(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getActivityFeed(cursor, limit);
  return success(c, result.items, result.meta);
}

// ── User Management ──
export async function getUsers(c: Context<AppEnv>) {
  const role = c.req.query("role");
  const rank = c.req.query("rank");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getUsers({ role, rank, cursor, limit });
  return success(c, result.items, result.meta);
}

export async function getUser(c: Context<AppEnv>) {
  const userId = c.req.param("id")!;
  const user = await adminService.getUserById(userId);
  return success(c, user);
}

export async function updateUser(c: Context<AppEnv>) {
  const admin = c.get("user");
  const userId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as UpdateUserInput;
  const user = await adminService.updateUser(admin.id, userId, body);
  return success(c, user);
}

export async function changeUserRole(c: Context<AppEnv>) {
  const admin = c.get("user");
  const userId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as ChangeRoleInput;
  const user = await adminService.changeUserRole(admin.id, userId, body);
  return success(c, user);
}

export async function deleteUser(c: Context<AppEnv>) {
  const admin = c.get("user");
  const userId = c.req.param("id")!;
  await adminService.deleteUser(admin.id, userId);
  return success(c, { message: "User deactivated" });
}

// ── Task Management ──
export async function createTask(c: Context<AppEnv>) {
  const admin = c.get("user");
  const body = c.req.valid("json" as never) as CreateTaskInput;
  const task = await adminService.createTask(admin.id, body);
  return created(c, task);
}

export async function getTasks(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getAllTasks(cursor, limit);
  return success(c, result.items, result.meta);
}

export async function updateTask(c: Context<AppEnv>) {
  const admin = c.get("user");
  const taskId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as UpdateTaskInput;
  const task = await adminService.updateTask(admin.id, taskId, body);
  return success(c, task);
}

export async function deleteTask(c: Context<AppEnv>) {
  const admin = c.get("user");
  const taskId = c.req.param("id")!;
  await adminService.deleteTask(admin.id, taskId);
  return success(c, { message: "Task deactivated" });
}

// ── Submission & Review Oversight ──
export async function getSubmissions(c: Context<AppEnv>) {
  const status = c.req.query("status");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getAllSubmissions({ status, cursor, limit });
  return success(c, result.items, result.meta);
}

export async function getSubmission(c: Context<AppEnv>) {
  const submissionId = c.req.param("id")!;
  const submission = await adminService.getSubmissionById(submissionId);
  return success(c, submission);
}

export async function manualAssign(c: Context<AppEnv>) {
  const admin = c.get("user");
  const submissionId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as ManualAssignInput;
  await adminService.manualAssign(admin.id, submissionId, body);
  return success(c, { message: "Judge assigned" });
}

export async function getUnassigned(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getUnassignedSubmissions(cursor, limit);
  return success(c, result.items, result.meta);
}

export async function reassign(c: Context<AppEnv>) {
  const admin = c.get("user");
  const submissionId = c.req.param("submissionId")!;
  const body = (await c.req.json().catch(() => ({}))) as { excludeJudgeId?: string };
  const assigned = await adminService.adminReassign(admin.id, submissionId, body.excludeJudgeId);
  return success(c, { assigned });
}

export async function overrideReview(c: Context<AppEnv>) {
  const admin = c.get("user");
  const reviewId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as OverrideReviewInput;
  const review = await adminService.overrideReview(admin.id, reviewId, body);
  return success(c, review);
}

export async function getAllReviews(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getAllReviews(cursor, limit);
  return success(c, result.items, result.meta);
}

// ── Leaderboard ──
export async function recalculateLeaderboard(c: Context<AppEnv>) {
  const result = await adminService.triggerLeaderboardRecalculation();
  return accepted(c, { message: "Leaderboard recalculation queued", jobId: result.jobId });
}

// ── Judge Management ──
export async function getJudges(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getJudges(cursor, limit);
  return success(c, result.items, result.meta);
}

// ── Community Posts (Admin CRUD) ──

export async function uploadImage(c: Context<AppEnv>) {
  const body = await c.req.parseBody();
  const file = body["file"] || body["image"]; // Match frontend default field name 'image'

  if (!file || typeof file === "string") {
    return c.json({ success: false, error: { message: "No valid file uploaded", code: "BAD_REQUEST" } }, 400);
  }

  // Convert hono File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const url = await uploadFile(buffer, file.type, file.name, "posts");
  return success(c, { url });
}

export async function createPost(c: Context<AppEnv>) {
  const admin = c.get("user");
  const data = c.req.valid("json" as never) as CreatePostInput;
  const post = await adminService.createPost(admin.id, data);
  return created(c, post);
}

export async function getAdminPosts(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getAdminPosts(cursor, limit);
  return success(c, result.items, result.meta);
}

export async function updatePost(c: Context<AppEnv>) {
  const admin = c.get("user");
  const postId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as UpdatePostInput;
  const post = await adminService.updatePost(admin.id, postId, body);
  return success(c, post);
}

export async function deletePost(c: Context<AppEnv>) {
  const admin = c.get("user");
  const postId = c.req.param("id")!;
  await adminService.deletePost(admin.id, postId);
  return success(c, { message: "Post deleted" });
}

// ── Audit Log ──
export async function getAuditLog(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await adminService.getAuditLog(cursor, limit);
  return success(c, result.items, result.meta);
}
