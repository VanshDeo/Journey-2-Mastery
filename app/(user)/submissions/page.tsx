'use client';

import { useState } from 'react';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function SubmissionsPage() {
  const [status, setStatus] = useState<string>('');
  const { data: submissions, isLoading, isError, error, refetch } = useSubmissions(status || undefined);

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">My Submissions</h1>
          <p className="text-secondary-text mt-1">Track your submitted tasks and their review status.</p>
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!submissions || submissions.length === 0 ? (
        <EmptyState icon="inbox" title="No submissions yet" message="Complete a task to see your submissions here." actionLabel="Browse Tasks" onAction={() => window.location.href = '/tasks'} />
      ) : (
        <div className="space-y-3 stagger-fade">
          {submissions.map((sub) => (
            <Link key={sub.id} href={`/submissions/${sub.id}`} className="block">
              <div className="flex items-center justify-between p-4 rounded-lg border border-borders bg-card-bg hover:bg-secondary-bg hover:border-japan-red/20 transition-all">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-primary-text truncate">{sub.taskTitle || sub.repoName || 'Submission'}</p>
                    <ExternalLink className="h-3 w-3 text-muted-text shrink-0" />
                  </div>
                  <p className="text-xs text-muted-text mt-0.5">
                    {sub.repoUrl.replace('https://github.com/', '')} · {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {sub.score !== undefined && sub.score !== null && (
                    <span className="text-sm font-semibold text-japan-red">{sub.score} pts</span>
                  )}
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
