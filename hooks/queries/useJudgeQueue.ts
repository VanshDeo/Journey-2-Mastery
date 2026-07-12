import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { JudgeDashboardData, JudgeWorkload, Submission, Review, ReviewCriterion } from '@/types/api.types';

export function useJudgeDashboard() {
  return useQuery<JudgeDashboardData, Error>({
    queryKey: ['judge', 'dashboard'],
    queryFn: () => apiFetch<JudgeDashboardData>('/judge/dashboard'),
    staleTime: 60 * 1000,
  });
}

export function useJudgeWorkload() {
  return useQuery<JudgeWorkload, Error>({
    queryKey: ['judge', 'workload'],
    queryFn: () => apiFetch<JudgeWorkload>('/judge/workload'),
    staleTime: 60 * 1000,
  });
}

export function useJudgeQueue(status?: string) {
  const params = status ? `?status=${status}` : '';
  return useQuery<Submission[], Error>({
    queryKey: ['judge', 'queue', status],
    queryFn: () => apiFetch<Submission[]>(`/judge/submissions${params}`),
    staleTime: 30 * 1000,
  });
}

export function useJudgeSubmission(id: string) {
  return useQuery<Submission, Error>({
    queryKey: ['judge', 'submissions', id],
    queryFn: () => apiFetch<Submission>(`/judge/submissions/${id}`),
    enabled: !!id,
  });
}

export function useJudgeCriteria(taskType?: string) {
  const params = taskType ? `?taskType=${taskType}` : '';
  return useQuery<ReviewCriterion[], Error>({
    queryKey: ['judge', 'criteria', taskType],
    queryFn: () => apiFetch<ReviewCriterion[]>(`/judge/criteria${params}`),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, ...data }: { submissionId: string; scores: { criterionId: string; score: number }[]; feedback: string }) =>
      apiFetch(`/judge/submissions/${submissionId}/review`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['judge', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['judge', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['judge', 'workload'] });
    },
  });
}

export function useJudgeReviews() {
  return useQuery<Review[], Error>({
    queryKey: ['judge', 'reviews'],
    queryFn: () => apiFetch<Review[]>('/judge/reviews'),
    staleTime: 60 * 1000,
  });
}

export function useJudgeReview(id: string) {
  return useQuery<Review, Error>({
    queryKey: ['judge', 'reviews', id],
    queryFn: () => apiFetch<Review>(`/judge/reviews/${id}`),
    enabled: !!id,
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; scores: { criterionId: string; score: number }[]; feedback: string }) =>
      apiFetch(`/judge/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['judge', 'reviews', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['judge', 'reviews'] });
    },
  });
}
