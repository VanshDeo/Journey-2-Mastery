import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { AuditLogEntry } from '@/types/api.types';

export function useAuditLog(filters?: { actor?: string; action?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.actor) params.set('actor', filters.actor);
  if (filters?.action) params.set('action', filters.action);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery<AuditLogEntry[], Error>({
    queryKey: ['admin', 'audit-log', filters],
    queryFn: () => apiFetch<AuditLogEntry[]>(`/admin/audit-log${qs ? `?${qs}` : ''}`),
    staleTime: 30 * 1000,
  });
}
