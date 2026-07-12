import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Submission } from '@/types/api.types';

export function useSubmissions(status?: string) {
  const params = status ? `?status=${status}` : '';
  return useQuery<Submission[], Error>({
    queryKey: ['user', 'submissions', status],
    queryFn: () => apiFetch<Submission[]>(`/user/submissions${params}`),
    staleTime: 30 * 1000,
  });
}

export function useSubmission(id: string) {
  return useQuery<Submission, Error>({
    queryKey: ['user', 'submissions', id],
    queryFn: () => apiFetch<Submission>(`/user/submissions/${id}`),
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { taskId: string; repoId: string; repoUrl: string; repoName: string }) =>
      apiFetch<Submission>('/user/submissions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'tasks', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'submissions'] });
    },
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, repoId, repoUrl, repoName }: { id: string; repoId: string; repoUrl: string; repoName: string }) =>
      apiFetch(`/user/submissions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ repoId, repoUrl, repoName }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'submissions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['user', 'submissions'] });
    },
  });
}

export function useWithdrawSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/user/submissions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'submissions'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'tasks'] });
    },
  });
}
