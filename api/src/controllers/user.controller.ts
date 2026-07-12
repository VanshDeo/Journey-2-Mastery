import type { Context } from "hono";
import type { AppEnv } from "../types/index.js";
import * as userService from "../services/user.service.js";
import * as githubService from "../services/github.service.js";
import { success, created } from "../utils/apiResponse.js";
import type {
  CreateSubmissionInput,
  UpdateSubmissionInput,
  UpdateProfileInput,
  TaskFilterInput,
} from "../validators/user.validator.js";

// ── Dashboard ──

export async function getDashboard(c: Context<AppEnv>) {
  const user = c.get("user");
  const data = await userService.getDashboard(user.id);
  return success(c, data);
}

// ── Tasks ──

export async function getTasks(c: Context<AppEnv>) {
  const user = c.get("user");
  const filters = c.req.valid("query" as never) as TaskFilterInput;
  const result = await userService.getAvailableTasks(user.id, filters);
  return success(c, result.items, result.meta);
}

export async function getTask(c: Context<AppEnv>) {
  const taskId = c.req.param("taskId")!;
  const task = await userService.getTaskById(taskId);
  return success(c, task);
}

export async function getCompletedTasks(c: Context<AppEnv>) {
  const user = c.get("user");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await userService.getCompletedTasks(user.id, cursor, limit);
  return success(c, result.items, result.meta);
}

export async function getPendingTasks(c: Context<AppEnv>) {
  const user = c.get("user");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await userService.getPendingTasks(user.id, cursor, limit);
  return success(c, result.items, result.meta);
}

// ── GitHub Repos ──

export async function getGitHubRepos(c: Context<AppEnv>) {
  const user = c.get("user");
  const repos = await githubService.getUserRepos(user.id);
  return success(c, repos);
}

// ── Submissions ──

export async function createSubmission(c: Context<AppEnv>) {
  const user = c.get("user");
  const body = c.req.valid("json" as never) as CreateSubmissionInput;
  const submission = await userService.createSubmission(user.id, body);
  return created(c, submission);
}

export async function getSubmissions(c: Context<AppEnv>) {
  const user = c.get("user");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await userService.getSubmissions(user.id, cursor, limit);
  return success(c, result.items, result.meta);
}

export async function getSubmission(c: Context<AppEnv>) {
  const user = c.get("user");
  const submissionId = c.req.param("id")!;
  const submission = await userService.getSubmissionById(user.id, submissionId);
  return success(c, submission);
}

export async function updateSubmission(c: Context<AppEnv>) {
  const user = c.get("user");
  const submissionId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as UpdateSubmissionInput;
  const submission = await userService.updateSubmission(user.id, submissionId, body);
  return success(c, submission);
}

export async function deleteSubmission(c: Context<AppEnv>) {
  const user = c.get("user");
  const submissionId = c.req.param("id")!;
  await userService.deleteSubmission(user.id, submissionId);
  return success(c, { message: "Submission withdrawn successfully" });
}

// ── Profile ──

export async function getProfile(c: Context<AppEnv>) {
  const user = c.get("user");
  const data = await userService.getProfile(user.id);
  return success(c, data);
}

export async function updateProfile(c: Context<AppEnv>) {
  const user = c.get("user");
  const body = c.req.valid("json" as never) as UpdateProfileInput;
  const data = await userService.updateProfile(user.id, body);
  return success(c, data);
}

// ── Settings ──

export async function getSettings(c: Context<AppEnv>) {
  const user = c.get("user");
  const data = await userService.getSettings(user.id);
  return success(c, data);
}

export async function updateSettings(c: Context<AppEnv>) {
  const user = c.get("user");
  // Validate using a schema if we had one, but for now just accept any json
  const body = await c.req.json();
  const data = await userService.updateSettings(user.id, body);
  return success(c, data);
}

// ── Account ──

export async function deleteAccount(c: Context<AppEnv>) {
  const user = c.get("user");
  await userService.deleteAccount(user.id);
  return success(c, { message: "Account deleted" });
}
