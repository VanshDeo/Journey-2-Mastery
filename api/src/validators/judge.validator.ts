import { z } from "zod";

/**
 * POST /api/v1/judge/submissions/:id/review
 */
export const submitReviewSchema = z.object({
  scores: z.array(z.object({
    criterionId: z.string(),
    score: z.number().int().min(0).max(100),
  })).optional(),
  scoreBreakdown: z.record(z.string(), z.number()).optional(),
  totalScore: z.number().int().min(0).max(100).optional(),
  feedback: z.string().min(1).max(5000),
  decision: z.enum(["approved", "rejected"]).optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

/**
 * PATCH /api/v1/judge/reviews/:id
 */
export const editReviewSchema = z.object({
  scores: z.array(z.object({
    criterionId: z.string(),
    score: z.number().int().min(0).max(100),
  })).optional(),
  scoreBreakdown: z.record(z.string(), z.number()).optional(),
  totalScore: z.number().int().min(0).max(100).optional(),
  feedback: z.string().min(1).max(5000).optional(),
  decision: z.enum(["approved", "rejected"]).optional(),
});

export type EditReviewInput = z.infer<typeof editReviewSchema>;
