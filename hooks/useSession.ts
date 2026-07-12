import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { User } from '@/types/api.types';
import { useRouter } from 'next/navigation';

export function useSession() {
  return useQuery<User, Error>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await apiFetch<{ user: User }>('/auth/me', { skipRedirect: true } as RequestInit & { skipRedirect?: boolean });
      return res.user;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useProfileStatus() {
  return useQuery<{ isProfileComplete: boolean }, Error>({
    queryKey: ['session', 'profile-status'],
    queryFn: () => apiFetch<{ isProfileComplete: boolean }>('/auth/profile-status'),
    staleTime: 60 * 1000,
  });
}

export function useCompleteProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { fullName: string; collegeName: string; branch: string; year: string; phone: string; bio: string }) =>
      apiFetch('/auth/complete-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      router.push('/dashboard');
    },
    onError: (error: Error & { code?: string }) => {
      // On 409 (already completed), just redirect forward
      if (error.code === 'PROFILE_ALREADY_COMPLETE' || error.message?.includes('409')) {
        router.push('/dashboard');
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiFetch('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // Even on error, clear cache and redirect
      queryClient.clear();
      router.push('/login');
    },
  });
}
