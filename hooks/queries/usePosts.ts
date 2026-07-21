import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiUpload } from '@/lib/api-client';
import type { Post } from '@/types/api.types';

// ─── Public ───
export function usePosts() {
  return useQuery<Post[], Error>({
    queryKey: ['posts'],
    queryFn: () => apiFetch<Post[]>('/posts'),
    staleTime: 60 * 1000,
  });
}

export function usePost(id: string) {
  return useQuery<Post, Error>({
    queryKey: ['posts', id],
    queryFn: () => apiFetch<Post>(`/posts/${id}`),
    enabled: !!id,
  });
}

// ─── Admin ───
export function useAdminPosts() {
  return useQuery<Post[], Error>({
    queryKey: ['admin', 'posts'],
    queryFn: () => apiFetch<Post[]>('/admin/posts'),
    staleTime: 30 * 1000,
  });
}

export function useAdminPost(id: string) {
  return useQuery<Post, Error>({
    queryKey: ['admin', 'posts', id],
    queryFn: () => apiFetch<Post>(`/admin/posts/${id}`),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description: string; posterImageUrl?: string; isPublished: boolean }) =>
      apiFetch<Post>('/admin/posts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string; posterImageUrl?: string; isPublished?: boolean }) =>
      apiFetch(`/admin/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', v.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUploadPostImage() {
  return useMutation({
    mutationFn: (file: File) => apiUpload<{ url: string }>('/admin/posts/upload-image', file),
  });
}
