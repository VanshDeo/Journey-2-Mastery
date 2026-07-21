import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import "dotenv/config";

async function runMigrate() {
  const dbUrl = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL_DIRECT or DATABASE_URL is not defined in environment variables");
  }

  console.log("Connecting to database for migrations using direct URL...");
  const migrationClient = postgres(dbUrl, { max: 1 });
  const db = drizzle(migrationClient);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  
  console.log("Migrations applied successfully!");
  await migrationClient.end();
}

runMigrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
