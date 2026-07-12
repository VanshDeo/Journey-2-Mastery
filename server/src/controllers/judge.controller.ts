import type { Context } from "hono";
import type { AppEnv } from "../types/index";
import * as judgeService from "../services/judge.service";
import { success, created } from "../utils/apiResponse";
import type { SubmitReviewInput, EditReviewInput } from "../validators/judge.validator";

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
  const criteriaList = [
    { id: "codeQuality", name: "Code Quality", maxScore: 25, description: "Clean, readable, well-structured code" },
    { id: "functionality", name: "Functionality", maxScore: 25, description: "All requirements met and working" },
    { id: "documentation", name: "Documentation", maxScore: 15, description: "README, comments, and code documentation" },
    { id: "testing", name: "Testing", maxScore: 15, description: "Test coverage and test quality" },
    { id: "creativity", name: "Creativity", maxScore: 20, description: "Innovation, UX, and going above requirements" },
  ];
  return success(c, criteriaList);
}
