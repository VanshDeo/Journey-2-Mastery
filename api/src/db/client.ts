import { drizzle } from "drizzle-orm/postgres-js";
import { queryClient } from "../config/db.js";
import * as schema from "./schema.js";

/**
 * Drizzle ORM database client.
 * Uses postgres.js under the hood, connected through Supabase Supavisor pooler.
 * Import this everywhere you need DB access.
 */
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
