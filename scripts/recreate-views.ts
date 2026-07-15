import { db } from "../server/src/db/client";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Recreating leaderboard view...");
  
  // Drop view if exists
  await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS leaderboard`);
  
  // Create view
  await db.execute(sql`
    CREATE MATERIALIZED VIEW leaderboard AS
    WITH combined AS (
      -- Solo Users
      SELECT
        u.id AS user_id,
        u.username,
        u.full_name,
        u.avatar_url,
        u.rank AS rank,
        u.score AS total_score,
        COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END)::int AS tasks_completed,
        'solo' AS entity_type
      FROM users u
      LEFT JOIN submissions s ON s.user_id = u.id AND s.status = 'approved' AND s.team_id IS NULL
      WHERE u.is_active = true AND u.role = 'user'
      GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.rank, u.score

      UNION ALL

      -- Teams
      SELECT
        t.id AS user_id,
        t.name AS username,
        NULL AS full_name,
        NULL AS avatar_url,
        'Team' AS rank,
        t.score AS total_score,
        COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END)::int AS tasks_completed,
        'team' AS entity_type
      FROM teams t
      LEFT JOIN submissions s ON s.team_id = t.id AND s.status = 'approved'
      GROUP BY t.id, t.name, t.score
    )
    SELECT
      user_id,
      username,
      full_name,
      avatar_url,
      rank,
      total_score,
      tasks_completed,
      entity_type,
      RANK() OVER (ORDER BY total_score DESC) AS leaderboard_rank
    FROM combined
    ORDER BY total_score DESC
  `);
  
  // Create unique index
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_user_id_idx ON leaderboard (user_id)`);
  
  // Create helper function
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION refresh_leaderboard()
    RETURNS void AS $$
    BEGIN
      REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
    END;
    $$ LANGUAGE plpgsql
  `);

  // Secure view from direct Supabase PostgREST public API bypass
  console.log("Securing leaderboard view from public API roles...");
  await db.execute(sql`REVOKE SELECT ON public.leaderboard FROM anon`);
  await db.execute(sql`REVOKE SELECT ON public.leaderboard FROM authenticated`);
  await db.execute(sql`REVOKE SELECT ON public.leaderboard FROM PUBLIC`);
  
  console.log("Leaderboard view successfully recreated and secured!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed to recreate view:", err);
  process.exit(1);
});
