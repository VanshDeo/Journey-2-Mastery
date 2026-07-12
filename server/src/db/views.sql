-- ============================================
-- Leaderboard Materialized View
-- ============================================
-- Derived from submissions + reviews + users + teams.
-- Refreshed via REFRESH MATERIALIZED VIEW CONCURRENTLY by the
-- leaderboard-recalculate BullMQ job, never computed live on read.
--
-- Run this SQL after Drizzle migrations to create the view.
-- ============================================

DROP MATERIALIZED VIEW IF EXISTS leaderboard;

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
ORDER BY total_score DESC;

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX leaderboard_user_id_idx ON leaderboard (user_id);

-- ============================================
-- Helper function to refresh the leaderboard
-- ============================================
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Security: Revoke default public API access
-- (Secures view from direct Supabase PostgREST bypass)
-- ============================================
REVOKE SELECT ON public.leaderboard FROM anon;
REVOKE SELECT ON public.leaderboard FROM authenticated;
