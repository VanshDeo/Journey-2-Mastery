import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { TeamDetail } from '@/types/api.types';

export function useTeamDetail() {
  return useQuery<TeamDetail | null, Error>({
    queryKey: ['user', 'team'],
    queryFn: () => apiFetch<TeamDetail | null>('/teams/my'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      apiFetch<TeamDetail>('/teams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useJoinTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string }) =>
      apiFetch<{ success: boolean }>('/teams/join', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useUpdateTeamName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, name }: { teamId: string; name: string }) =>
      apiFetch<TeamDetail>(`/teams/${teamId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
    },
  });
}

export function useRegenerateJoinCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) =>
      apiFetch<{ joinCode: string }>(`/teams/${teamId}/regenerate-code`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
    },
  });
}

export function useDisbandTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) =>
      apiFetch<{ message: string }>(`/teams/${teamId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) =>
      apiFetch<{ message: string }>(`/teams/${teamId}/leave`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useKickMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      apiFetch<{ message: string }>(`/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
    },
  });
}

export function useTransferLeadership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, newLeaderId }: { teamId: string; newLeaderId: string }) =>
      apiFetch<{ message: string }>(`/teams/${teamId}/transfer-leadership`, {
        method: 'PATCH',
        body: JSON.stringify({ newLeaderId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'team'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}
