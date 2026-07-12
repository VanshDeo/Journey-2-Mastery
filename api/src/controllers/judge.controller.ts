import type { Context } from "hono";
import type { AppEnv } from "../types/index.js";
import * as judgeService from "../services/judge.service.js";
import { success, created } from "../utils/apiResponse.js";
import type { SubmitReviewInput, EditReviewInput } from "../validators/judge.validator.js";

export async function getDashboard(c: Context<AppEnv>) {
  const user = c.get("user");
  const data = await judgeService.getDashboard(user.id);
  return success(c, data);
}

export async function getSubmissions(c: Context<AppEnv>) {
  const user = c.get("user");
  const status = c.req.query("status");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await judgeService.getAssignedSubmissions(user.id, status, cursor, limit);
  return success(c, result.items, result.meta);
}

export async function getSubmission(c: Context<AppEnv>) {
  const user = c.get("user");
  const submissionId = c.req.param("id")!;
  const submission = await judgeService.getSubmissionForReview(user.id, submissionId);
  return success(c, submission);
}

export async function submitReview(c: Context<AppEnv>) {
  const user = c.get("user");
  const submissionId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as SubmitReviewInput;
  const review = await judgeService.submitReview(user.id, submissionId, body);
  return created(c, review);
}

export async function editReview(c: Context<AppEnv>) {
  const user = c.get("user");
  const reviewId = c.req.param("id")!;
  const body = c.req.valid("json" as never) as EditReviewInput;
  const review = await judgeService.editReview(user.id, reviewId, body);
  return success(c, review);
}

export async function getReviews(c: Context<AppEnv>) {
  const user = c.get("user");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await judgeService.getReviews(user.id, cursor, limit);
  return success(c, result.items, result.meta);
}

export async function getReviewById(c: Context<AppEnv>) {
  const user = c.get("user");
  const reviewId = c.req.param("id")!;
  const review = await judgeService.getReviewById(user.id, reviewId);
  return success(c, review);
}

export async function getWorkload(c: Context<AppEnv>) {
  const user = c.get("user");
  const workload = await judgeService.getWorkload(user.id);
  return success(c, workload);
}

export async function getCriteria(c: Context<AppEnv>) {
  return success(c, {
    rubric: {
      codeQuality: { maxScore: 25, description: "Clean, readable, well-structured code" },
      functionality: { maxScore: 25, description: "All requirements met and working" },
      documentation: { maxScore: 15, description: "README, comments, and code documentation" },
      testing: { maxScore: 15, description: "Test coverage and test quality" },
      creativity: { maxScore: 20, description: "Innovation, UX, and going above requirements" },
    },
    totalMaxScore: 100,
  });
}
