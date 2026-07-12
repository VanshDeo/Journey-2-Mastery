-- ============================================
-- Leaderboard Materialized View
-- ============================================
-- Derived from submissions + reviews + users.
-- Refreshed via REFRESH MATERIALIZED VIEW CONCURRENTLY by the
-- leaderboard-recalculate BullMQ job, never computed live on read.
--
-- Run this SQL after Drizzle migrations to create the view.
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT
  u.id AS user_id,
  u.username,
  u.full_name,
  u.avatar_url,
  u.rank,
  COALESCE(SUM(r.total_score), 0)::int AS total_score,
  COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END)::int AS tasks_completed,
  RANK() OVER (ORDER BY COALESCE(SUM(r.total_score), 0) DESC) AS leaderboard_rank
FROM users u
LEFT JOIN submissions s ON s.user_id = u.id AND s.status = 'approved'
LEFT JOIN reviews r ON r.submission_id = s.id
WHERE u.role = 'user' AND u.is_active = true
GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.rank
ORDER BY total_score DESC;

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_user_id_idx ON leaderboard (user_id);

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
