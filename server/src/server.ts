import { serve } from "@hono/node-server";
import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

/**
 * Server entry point.
 * Environment is already validated by config/env.ts (fail-fast).
 */
const port = env.PORT;

logger.info(`Starting J2M API server in ${env.NODE_ENV} mode...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`🚀 J2M API server running on http://localhost:${info.port}`);
    logger.info(`   Health: http://localhost:${info.port}/api/v1/health`);
    logger.info(`   Env: ${env.NODE_ENV}`);
  }
);

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Promise Rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught Exception — shutting down");
  process.exit(1);
});
