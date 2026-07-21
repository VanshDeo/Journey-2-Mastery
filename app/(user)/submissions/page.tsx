'use client';

import { useState } from 'react';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ExternalLink, Scroll } from 'lucide-react';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function SubmissionsPage() {
  const [status, setStatus] = useState<string>('');
  const { data: submissions, isLoading, isError, error, refetch } = useSubmissions(status || undefined);

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-10 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply scale-105 grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <Scroll className="h-10 w-10 text-japan-red" />
              Scrolls of Trial
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Track your submitted tasks and their review status from the masters.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-borders flex items-center gap-3">
             <NinjaStarIcon className="w-5 h-5 text-japan-red" />
             <span className="font-bold text-lg">{submissions?.length || 0} Submissions</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-primary-text">Your Submissions</h2>
        <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48 bg-white border-borders shadow-sm h-11 font-medium">
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
        <EmptyState icon="inbox" title="The scroll is empty" message="Complete a task to see your submissions here." actionLabel="Browse Tasks" onAction={() => window.location.href = '/tasks'} />
      ) : (
        <div className="space-y-4 stagger-fade max-w-5xl">
          {submissions.map((sub) => (
            <Link key={sub.id} href={`/submissions/${sub.id}`} className="block group">
              <div className="flex items-center justify-between p-5 rounded-xl border border-borders bg-white shadow-sm group-hover:shadow-md group-hover:border-japan-red/40 transition-all">
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <NinjaStarIcon className="h-4 w-4 text-japan-red opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="font-bold text-lg text-primary-text truncate group-hover:text-japan-red transition-colors">{sub.taskTitle || sub.repoName || 'Submission'}</p>
                    <ExternalLink className="h-4 w-4 text-muted-text shrink-0 ml-2" />
                  </div>
                  <p className="text-sm text-secondary-text font-medium pl-6">
                    {sub.repoUrl.replace('https://github.com/', '')} <span className="mx-2 text-borders">|</span> {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {sub.score !== undefined && sub.score !== null && (
                    <span className="text-base font-bold text-japan-red px-3 py-1 bg-red-50 rounded-full">{sub.score} pts</span>
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
