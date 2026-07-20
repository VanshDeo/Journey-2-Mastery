import { z } from "zod";

/**
 * POST /api/v1/auth/complete-profile
 * One-time profile completion after first GitHub login.
 */
export const completeProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  collegeName: z.string().min(2).max(200),
  branch: z.string().min(2).max(100),
  year: z.string().min(1).max(20),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[+]?[\d\s()-]+$/, "Invalid phone number format"),
  bio: z.string().max(500).optional().default(""),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;

/**
 * POST /api/v1/auth/refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
