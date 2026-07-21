import { z } from 'zod';

// ─── Profile Completion ───
export const completeProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  collegeName: z.string().min(2, 'College name is required').max(200),
  branch: z.string().min(2, 'Branch is required').max(100),
  year: z.string().min(1, 'Year is required'),
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional().default(''),
});
export type CompleteProfileForm = z.infer<typeof completeProfileSchema>;

// ─── Profile Update ───
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  collegeName: z.string().min(2).max(200).optional(),
  branch: z.string().min(2).max(100).optional(),
  year: z.string().optional(),
  phone: z.string().min(10).max(15).optional(),
  bio: z.string().max(500).optional(),
});
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

// ─── Task Management (Admin) ───
export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  shortDescription: z.string().min(5, 'Short description is required').max(500),
  description: z.string().min(10, 'Task details must be at least 10 characters'),
  requirements: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.coerce.number().min(1, 'Points must be at least 1').max(1000),
  bonusPoints: z.coerce.number().min(0).default(0),
  rankRequired: z.enum(['Ronin', 'Kenshi', 'Samurai', 'Shogun']).optional(),
  deadline: z.string().optional(),
});
export type TaskForm = z.infer<typeof taskSchema>;

// ─── Review Submission (Judge) ───
export const reviewSchema = z.object({
  scores: z.array(z.object({
    criterionId: z.string(),
    score: z.coerce.number().min(0),
  })).min(1, 'At least one criterion score is required'),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
});
export type ReviewForm = z.infer<typeof reviewSchema>;

// ─── Post Creation (Admin) ───
export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});
export type PostForm = z.infer<typeof postSchema>;

// ─── Settings ───
export const settingsSchema = z.object({
  emailNotifications: z.boolean(),
  submissionUpdates: z.boolean(),
  reviewNotifications: z.boolean(),
  leaderboardUpdates: z.boolean(),
});
export type SettingsForm = z.infer<typeof settingsSchema>;

// ─── Comment ───
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});
export type CommentForm = z.infer<typeof commentSchema>;

// ─── Override Review (Admin) ───
export const overrideReviewSchema = z.object({
  score: z.coerce.number().min(0),
  reason: z.string().min(10, 'A reason is required when overriding a score').max(500),
});
export type OverrideReviewForm = z.infer<typeof overrideReviewSchema>;
