import { cn } from '@/lib/utils';
import { InboxIcon, FileText, ListChecks, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap = {
  inbox: InboxIcon,
  file: FileText,
  list: ListChecks,
  users: Users,
};

interface EmptyStateProps {
  icon?: keyof typeof iconMap;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon = 'inbox',
  title = 'Nothing here yet',
  message = 'No data available.',
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-secondary-bg flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-muted-text" />
      </div>
      <h3 className="text-lg font-serif font-semibold text-primary-text mb-1">{title}</h3>
      <p className="text-sm text-muted-text max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
