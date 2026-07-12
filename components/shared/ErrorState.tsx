import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.';

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-lg font-serif font-semibold text-primary-text mb-1">Something went wrong</h3>
      <p className="text-sm text-muted-text max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
