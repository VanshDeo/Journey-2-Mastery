import { cn } from '@/lib/utils';
import type { SubmissionStatus } from '@/types/api.types';
import { Clock, Eye, CheckCircle2, XCircle } from 'lucide-react';

const statusConfig: Record<SubmissionStatus, { icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string; label: string }> = {
  pending: {
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Pending',
  },
  in_review: {
    icon: Eye,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    label: 'In Review',
  },
  approved: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    label: 'Approved',
  },
  rejected: {
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Rejected',
  },
};

interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
