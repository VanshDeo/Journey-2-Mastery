'use client';

import { useJudgeQueue } from '@/hooks/queries/useJudgeQueue';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function JudgeQueuePage() {
  const { data: submissions, isLoading, isError, error, refetch } = useJudgeQueue();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text">Review Queue</h1>
        <p className="text-secondary-text mt-1">Submissions assigned to you for review.</p>
      </div>

      {!submissions || submissions.length === 0 ? (
        <EmptyState icon="inbox" title="Queue empty" message="No submissions waiting for your review. Check back later!" />
      ) : (
        <div className="space-y-3 stagger-fade">
          {submissions.map((sub) => (
            <Link key={sub.id} href={`/judge/submissions/${sub.id}`} className="block">
              <Card className="hover:shadow-md hover:border-japan-red/20 transition-all cursor-pointer">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-primary-text">{sub.taskTitle || 'Submission'}</p>
                      <ExternalLink className="h-3 w-3 text-muted-text" />
                    </div>
                    <p className="text-xs text-muted-text">
                      by {sub.userName || 'Unknown'} · {sub.repoUrl.replace('https://github.com/', '')}
                    </p>
                    <p className="text-xs text-muted-text mt-0.5">
                      Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
