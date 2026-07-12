import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "./types/index";
import { env } from "./config/env";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { rateLimiter } from "./middleware/rateLimit.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { logger } from "./config/logger";
import v1Routes from "./routes/v1/index";

const app = new Hono<AppEnv>();

// ──────────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────────

// Request ID for tracing
app.use("*", requestIdMiddleware);

// Security headers
app.use("*", secureHeaders());

// CORS
app.use(
  "*",
  cors({
    origin: env.FRONTEND_URL,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    exposeHeaders: ["X-Request-ID", "X-RateLimit-Remaining", "Retry-After"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Rate limiting
app.use("/api/*", rateLimiter());

// Request logging
app.use("*", async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const elapsed = Date.now() - start;
  const status = c.res.status;
  const requestId = c.get("requestId") ?? "-";

  logger.info(
    { method, path, status, elapsed, requestId },
    `${method} ${path} ${status} ${elapsed}ms`
  );
});

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Mount v1 API
app.route("/api/v1", v1Routes);

// Root redirect to health check
app.get("/", (c) =>
  c.json({
    name: "Journey to Mastery API",
    version: "1.0.0",
    docs: "/api/v1/health",
  })
);

// ──────────────────────────────────────────────
// Error Handling
// ──────────────────────────────────────────────

// 404 handler
app.notFound((c) =>
  c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404
  )
);

// Centralized error handler
app.onError(errorHandler);

export default app;
