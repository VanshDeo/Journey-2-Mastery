import { Hono } from "hono";
import type { AppEnv } from "../../types/index";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { submitReviewSchema, editReviewSchema } from "../../validators/judge.validator";
import * as judgeController from "../../controllers/judge.controller";

const judge = new Hono<AppEnv>();

// All judge routes require auth + judge role (admin can also access)
judge.use("/*", authMiddleware, requireRole(["judge", "admin"]));

// Dashboard
judge.get("/dashboard", judgeController.getDashboard);

// Submissions queue
judge.get("/submissions", judgeController.getSubmissions);
judge.get("/submissions/:id", judgeController.getSubmission);
judge.post(
  "/submissions/:id/review",
  validate("json", submitReviewSchema),
  judgeController.submitReview
);

// Reviews
judge.get("/reviews", judgeController.getReviews);
judge.get("/reviews/:id", judgeController.getReviewById);
judge.patch(
  "/reviews/:id",
  validate("json", editReviewSchema),
  judgeController.editReview
);

// Criteria
judge.get("/criteria", judgeController.getCriteria);

// Workload
judge.get("/workload", judgeController.getWorkload);

export default judge;
