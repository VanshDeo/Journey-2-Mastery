import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds default stale time
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: true, // Refetch when window regains focus
    },
  },
});
