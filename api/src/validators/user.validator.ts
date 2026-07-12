import { z } from "zod";

/**
 * POST /api/v1/user/submissions
 * Submit a task for review by picking a repo.
 */
export const createSubmissionSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  repoId: z.string().min(1, "Repository ID is required"),
  repoUrl: z.string().url("Invalid repository URL"),
  repoName: z.string().min(1, "Repository name is required"),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

/**
 * PATCH /api/v1/user/submissions/:id
 * Update a pending submission's repo.
 */
export const updateSubmissionSchema = z.object({
  repoId: z.string().min(1, "Repository ID is required"),
  repoUrl: z.string().url("Invalid repository URL"),
  repoName: z.string().min(1, "Repository name is required"),
});

export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;

/**
 * PATCH /api/v1/user/profile
 * Update own profile.
 */
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Query params for GET /api/v1/user/tasks
 */
export const taskFilterSchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  search: z.string().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
