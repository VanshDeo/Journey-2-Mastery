import { z } from "zod";

/**
 * POST /api/v1/admin/tasks
 */
export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.string().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"]),
  rankRequired: z.enum(["Ronin", "Kenshi", "Samurai", "Shogun"]).default("Ronin"),
  points: z.number().int().min(0).max(1000),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * PATCH /api/v1/admin/tasks/:id
 */
export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  category: z.string().min(1).max(100).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  rankRequired: z.enum(["Ronin", "Kenshi", "Samurai", "Shogun"]).optional(),
  points: z.number().int().min(0).max(1000).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * PATCH /api/v1/admin/users/:id
 */
export const updateUserSchema = z.object({
  role: z.enum(["admin", "judge", "user"]).optional(),
  rank: z.enum(["Ronin", "Kenshi", "Samurai", "Shogun"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * PATCH /api/v1/admin/users/:id/role
 */
export const changeRoleSchema = z.object({
  role: z.enum(["admin", "judge", "user"]),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

/**
 * POST /api/v1/admin/submissions/:id/assign
 */
export const manualAssignSchema = z.object({
  judgeId: z.string().uuid("Invalid judge ID"),
});

export type ManualAssignInput = z.infer<typeof manualAssignSchema>;

/**
 * PATCH /api/v1/admin/reviews/:id/override
 */
export const overrideReviewSchema = z.object({
  totalScore: z.number().int().min(0).max(100).optional(),
  feedback: z.string().max(5000).optional(),
  decision: z.enum(["approved", "rejected"]).optional(),
});

export type OverrideReviewInput = z.infer<typeof overrideReviewSchema>;

/**
 * POST /api/v1/admin/posts
 */
export const createPostSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().min(10),
  posterImageUrl: z.string().url().optional(),
  isPublished: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/**
 * PATCH /api/v1/admin/posts/:id
 */
export const updatePostSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  description: z.string().min(10).optional(),
  posterImageUrl: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
