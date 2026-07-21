import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { LeaderboardEntry, RankTier } from '@/types/api.types';

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['leaderboard'],
    queryFn: () => apiFetch<LeaderboardEntry[]>('/leaderboard'),
    staleTime: 30 * 1000,
  });
}

export function useRanks() {
  return useQuery<RankTier[], Error>({
    queryKey: ['ranks'],
    queryFn: () => apiFetch<RankTier[]>('/ranks'),
    staleTime: 30 * 60 * 1000, // Rarely changes
  });
}
