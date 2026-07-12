import { Hono } from "hono";
import type { AppEnv } from "../../types/index.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  completeProfileSchema,
  refreshTokenSchema,
} from "../../validators/auth.validator.js";
import * as authController from "../../controllers/auth.controller.js";

const auth = new Hono<AppEnv>();

// ── Public routes ──

/** Redirect to GitHub OAuth consent screen */
auth.get("/github", authController.githubRedirect);

/** GitHub OAuth callback — exchange code for JWT */
auth.get("/github/callback", authController.githubCallback);

/** Refresh JWT token */
auth.post(
  "/refresh",
  validate("json", refreshTokenSchema),
  authController.refreshToken
);

// ── Authenticated routes ──

/** Get current logged-in user */
auth.get("/me", authMiddleware, authController.getMe);

/** Invalidate session/token */
auth.post("/logout", authMiddleware, authController.logout);

/** Check if profile setup is pending */
auth.get("/profile-status", authMiddleware, authController.getProfileStatus);

/** One-time profile completion (409 on repeat) */
auth.post(
  "/complete-profile",
  authMiddleware,
  validate("json", completeProfileSchema),
  authController.completeProfile
);

/** Active sessions */
auth.get("/sessions", authMiddleware, authController.getSessions);
auth.delete("/sessions/:id", authMiddleware, authController.revokeSession);

export default auth;
