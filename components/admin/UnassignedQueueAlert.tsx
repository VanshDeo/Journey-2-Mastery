'use client';

import { useUnassignedSubmissions } from '@/hooks/queries/useAdminDashboard';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UnassignedQueueAlertProps {
  className?: string;
}

export default function UnassignedQueueAlert({ className }: UnassignedQueueAlertProps) {
  const { data: unassigned } = useUnassignedSubmissions();
  const count = unassigned?.length ?? 0;

  if (count === 0) return null;

  return (
    <Link
      href="/admin/submissions/unassigned"
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 transition-colors hover:bg-amber-100',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <AlertCircle className="h-5 w-5 text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-amber-800">
          {count} unassigned submission{count !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-amber-600">Click to review and reassign</p>
      </div>
    </Link>
  );
}
