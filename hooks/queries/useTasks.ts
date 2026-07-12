import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Task, Category } from '@/types/api.types';

interface TaskFilters {
  category?: string;
  difficulty?: string;
  search?: string;
}

function buildTaskQuery(filters?: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useTasks(filters?: TaskFilters) {
  return useQuery<Task[], Error>({
    queryKey: ['user', 'tasks', filters],
    queryFn: () => apiFetch<Task[]>(`/user/tasks${buildTaskQuery(filters)}`),
    staleTime: 60 * 1000,
  });
}

export function useTaskDetail(taskId: string) {
  return useQuery<Task, Error>({
    queryKey: ['user', 'tasks', taskId],
    queryFn: () => apiFetch<Task>(`/user/tasks/${taskId}`),
    staleTime: 60 * 1000,
    enabled: !!taskId,
  });
}

export function useCompletedTasks() {
  return useQuery<Task[], Error>({
    queryKey: ['user', 'tasks', 'completed'],
    queryFn: () => apiFetch<Task[]>('/user/tasks/completed'),
    staleTime: 60 * 1000,
  });
}

export function usePendingTasks() {
  return useQuery<Task[], Error>({
    queryKey: ['user', 'tasks', 'pending'],
    queryFn: () => apiFetch<Task[]>('/user/tasks/pending'),
    staleTime: 60 * 1000,
  });
}

export function useTaskCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['tasks', 'categories'],
    queryFn: async () => [
      { id: 'Frontend', name: 'Frontend' },
      { id: 'Backend', name: 'Backend' },
      { id: 'Fullstack', name: 'Fullstack' },
      { id: 'DSA', name: 'DSA' },
      { id: 'System Design', name: 'System Design' },
      { id: 'AI/ML', name: 'AI/ML' },
      { id: 'DevOps', name: 'DevOps' },
    ],
    staleTime: Infinity,
  });
}
