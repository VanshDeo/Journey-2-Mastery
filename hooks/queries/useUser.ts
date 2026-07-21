import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { RepoInfo, User, UserBadge } from '@/types/api.types';

export interface UserDashboardData {
  rank: string;
  totalScore: number;
  tasksCompleted: number;
  tasksAvailable: number;
}

export function useUserDashboard() {
  return useQuery<UserDashboardData, Error>({
    queryKey: ['user', 'dashboard'],
    queryFn: () => apiFetch<UserDashboardData>('/user/dashboard'),
    staleTime: 60 * 1000,
  });
}

export function useGithubRepos(enabled = false) {
  return useQuery<RepoInfo[], Error>({
    queryKey: ['user', 'github', 'repos'],
    queryFn: () => apiFetch<RepoInfo[]>('/user/github/repos'),
    staleTime: 120 * 1000,
    enabled,
  });
}

export function useProfile() {
  return useQuery<User, Error>({
    queryKey: ['user', 'profile'],
    queryFn: () => apiFetch<User>('/user/profile'),
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) =>
      apiFetch('/user/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useUserBadges() {
  return useQuery<UserBadge[], Error>({
    queryKey: ['user', 'badges'],
    queryFn: () => apiFetch<UserBadge[]>('/user/badges'),
    staleTime: 5 * 60 * 1000,
  });
}
