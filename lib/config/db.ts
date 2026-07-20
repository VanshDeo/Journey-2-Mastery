import postgres from "postgres";
import { env } from "./env";

/**
 * postgres.js client connected via Supabase Supavisor pooler (transaction mode).
 * Used by Drizzle ORM for all database operations.
 */
export const queryClient = postgres(env.DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Required for transaction mode pooling (Supavisor)
});
