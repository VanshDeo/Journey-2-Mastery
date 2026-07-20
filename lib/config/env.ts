import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  API_VERSION: z.string().default("v1"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_DIRECT: z.string().optional(),

  // Redis
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  GITHUB_CALLBACK_URL: z.string().url(),

  // Encryption
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be at least 32 characters"),

  // Upload
  UPLOAD_PROVIDER: z.enum(["cloudinary", "s3", "local"]).default("local"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_GITHUB_MAX: z.coerce.number().int().positive().default(10),

  // Judge Auto-Assignment
  JUDGE_OVERLOAD_THRESHOLD: z.coerce.number().int().positive().default(15),
  JUDGE_TURNAROUND_SAMPLE_SIZE: z.coerce.number().int().positive().default(10),



  // Review
  REVIEW_EDIT_WINDOW_HOURS: z.coerce.number().int().positive().default(24),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "true") {
      console.error("❌ Invalid environment variables:");
      for (const issue of result.error.issues) {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      process.exit(1);
    } else {
      console.warn("⚠️ Invalid environment variables (non-production):");
      for (const issue of result.error.issues) {
        console.warn(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      return envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
        JWT_SECRET: process.env.JWT_SECRET || "12345678901234567890123456789012",
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "dummy_client_id",
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "dummy_client_secret",
        GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3001/api/v1/auth/github/callback",
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "12345678901234567890123456789012",
        ...process.env
      });
    }
  }

  return result.data;
}

export const env = validateEnv();
