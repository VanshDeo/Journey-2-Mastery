import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type {
  AdminDashboardData, AdminActivity, AdminUser, User,
  Task, Submission, Review, LeaderboardEntry,
  JudgePerformance, JudgeWorkload,
} from '@/types/api.types';
import { toast } from 'sonner';

// ─── Dashboard ───
export function useAdminDashboard() {
  return useQuery<AdminDashboardData, Error>({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiFetch<AdminDashboardData>('/admin/dashboard'),
    staleTime: 60 * 1000,
  });
}

export function useAdminActivity() {
  return useQuery<AdminActivity, Error>({
    queryKey: ['admin', 'dashboard', 'activity'],
    queryFn: () => apiFetch<AdminActivity>('/admin/dashboard/activity'),
    staleTime: 60 * 1000,
  });
}

// ─── Users ───
export function useAdminUsers(filters?: { role?: string; rank?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.role) params.set('role', filters.role);
  if (filters?.rank) params.set('rank', filters.rank);
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString();

  return useQuery<AdminUser[], Error>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => apiFetch<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ''}`),
    staleTime: 30 * 1000,
  });
}

export function useAdminUser(id: string) {
  return useQuery<AdminUser, Error>({
    queryKey: ['admin', 'users', id],
    queryFn: () => apiFetch<AdminUser>(`/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<User>) =>
      apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', v.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiFetch(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', v.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'judges'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// ─── Judges ───
export function useAdminJudges() {
  return useQuery<(AdminUser & { workload?: JudgeWorkload })[], Error>({
    queryKey: ['admin', 'judges'],
    queryFn: () => apiFetch<(AdminUser & { workload?: JudgeWorkload })[]>('/admin/judges'),
    staleTime: 60 * 1000,
  });
}

export function usePromoteJudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/judges/${id}/promote`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'judges'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDemoteJudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/judges/${id}/demote`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'judges'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useJudgePerformance(id: string) {
  return useQuery<JudgePerformance, Error>({
    queryKey: ['admin', 'judges', id, 'performance'],
    queryFn: () => apiFetch<JudgePerformance>(`/admin/judges/${id}/performance`),
    enabled: !!id,
  });
}

// ─── Tasks ───
export function useAdminTasks() {
  return useQuery<Task[], Error>({
    queryKey: ['admin', 'tasks'],
    queryFn: () => apiFetch<Task[]>('/admin/tasks'),
    staleTime: 60 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) =>
      apiFetch<Task>('/admin/tasks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Task>) =>
      apiFetch(`/admin/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/tasks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] });
    },
  });
}

// ─── Submissions ───
export function useAdminSubmissions(filters?: { status?: string; taskId?: string; userId?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.taskId) params.set('taskId', filters.taskId);
  if (filters?.userId) params.set('userId', filters.userId);
  const qs = params.toString();

  return useQuery<Submission[], Error>({
    queryKey: ['admin', 'submissions', filters],
    queryFn: () => apiFetch<Submission[]>(`/admin/submissions${qs ? `?${qs}` : ''}`),
    staleTime: 30 * 1000,
  });
}

export function useAdminSubmission(id: string) {
  return useQuery<Submission, Error>({
    queryKey: ['admin', 'submissions', id],
    queryFn: () => apiFetch<Submission>(`/admin/submissions/${id}`),
    enabled: !!id,
  });
}

export function useAssignJudge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, judgeId }: { submissionId: string; judgeId?: string }) =>
      apiFetch(`/admin/submissions/${submissionId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ judgeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] });
    },
  });
}

export function useOverrideReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, score, reason }: { reviewId: string; score: number; reason: string }) =>
      apiFetch(`/admin/reviews/${reviewId}/override`, {
        method: 'PATCH',
        body: JSON.stringify({ score, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] });
    },
  });
}

export function useAdminReviews() {
  return useQuery<Review[], Error>({
    queryKey: ['admin', 'reviews'],
    queryFn: () => apiFetch<Review[]>('/admin/reviews'),
    staleTime: 60 * 1000,
  });
}

// ─── Leaderboard ───
export function useAdminLeaderboard() {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['admin', 'leaderboard'],
    queryFn: () => apiFetch<LeaderboardEntry[]>('/admin/leaderboard'),
    staleTime: 30 * 1000,
  });
}

export function useRecalculateLeaderboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ jobId: string }>('/admin/leaderboard/recalculate', { method: 'POST' }),
    onSuccess: () => {
      toast.success('Leaderboard recalculation started');
      // Invalidate after a delay since backend returns 202
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      }, 5000);
    },
  });
}

// ─── Unassigned ───
export function useUnassignedSubmissions() {
  return useQuery<Submission[], Error>({
    queryKey: ['admin', 'assignment', 'unassigned'],
    queryFn: () => apiFetch<Submission[]>('/admin/assignment/unassigned'),
    staleTime: 30 * 1000,
  });
}

export function useReassignSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, excludeJudgeId }: { submissionId: string; excludeJudgeId?: string }) =>
      apiFetch(`/admin/assignment/reassign/${submissionId}`, {
        method: 'POST',
        body: JSON.stringify({ excludeJudgeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'assignment', 'unassigned'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'submissions'] });
    },
  });
}
