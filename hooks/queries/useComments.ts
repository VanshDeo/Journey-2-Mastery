import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Comment } from '@/types/api.types';

export function useComments(submissionId: string) {
  return useQuery<Comment[], Error>({
    queryKey: ['submissions', submissionId, 'comments'],
    queryFn: () => apiFetch<Comment[]>(`/submissions/${submissionId}/comments`),
    enabled: !!submissionId,
    staleTime: 30 * 1000,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, content }: { submissionId: string; content: string }) =>
      apiFetch<Comment>(`/submissions/${submissionId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['submissions', variables.submissionId, 'comments'] });
    },
  });
}
