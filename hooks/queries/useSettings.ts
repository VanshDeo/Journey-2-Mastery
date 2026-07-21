import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { UserSettings, UserSession } from '@/types/api.types';

export function useSettings() {
  return useQuery<UserSettings, Error>({
    queryKey: ['user', 'settings'],
    queryFn: () => apiFetch<UserSettings>('/user/settings'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserSettings>) =>
      apiFetch('/user/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    // Optimistic toggle
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: ['user', 'settings'] });
      const prev = queryClient.getQueryData<UserSettings>(['user', 'settings']);
      queryClient.setQueryData<UserSettings>(['user', 'settings'], (old) =>
        old ? { ...old, ...newSettings } : old
      );
      return { prev };
    },
    onError: (_err, _data, context) => {
      if (context?.prev) queryClient.setQueryData(['user', 'settings'], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['user', 'settings'] }),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => apiFetch('/user/account', { method: 'DELETE' }),
  });
}

export function useSessions() {
  return useQuery<UserSession[], Error>({
    queryKey: ['auth', 'sessions'],
    queryFn: () => apiFetch<UserSession[]>('/auth/sessions'),
    staleTime: 60 * 1000,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/auth/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] }),
  });
}
