import postgres from "postgres";
import { env } from "./env";

const globalForDb = globalThis as unknown as {
  postgres: postgres.Sql | undefined;
};

export const queryClient =
  globalForDb.postgres ??
  postgres(env.DATABASE_URL, {
    max: 20,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Required for transaction mode pooling (Supavisor)
  });

if (env.NODE_ENV !== "production") globalForDb.postgres = queryClient;
