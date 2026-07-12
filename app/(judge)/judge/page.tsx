'use client';

import { useJudgeDashboard, useJudgeWorkload } from '@/hooks/queries/useJudgeQueue';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function JudgeDashboard() {
  const { data: user } = useSession();
  const { data, isLoading, isError, error, refetch } = useJudgeDashboard();
  const { data: workload } = useJudgeWorkload();

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">
            Judge Dashboard
          </h1>
          <p className="text-secondary-text mt-1">Welcome, {user?.fullName || user?.username}</p>
        </div>
        <Link href="/judge/queue">
          <Button>Review Queue →</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-text">Pending Reviews</p>
              <p className="text-2xl font-bold text-primary-text">{data.pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-text">Reviewed</p>
              <p className="text-2xl font-bold text-primary-text">{data.reviewedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-muted-text">Avg Turnaround</p>
              <p className="text-2xl font-bold text-primary-text">{data.avgTurnaround || '—'}</p>
            </div>
          </CardContent>
        </Card>

        {workload && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-text">Load Score</p>
                <p className="text-2xl font-bold text-primary-text">{workload.loadScore}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader><CardTitle>Recent Reviews</CardTitle></CardHeader>
        <CardContent>
          {!data.recentReviews || data.recentReviews.length === 0 ? (
            <p className="text-sm text-muted-text py-4 text-center">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentReviews.slice(0, 5).map((review) => (
                <Link key={review.id} href={`/judge/reviews/${review.id}`} className="block">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-borders hover:bg-secondary-bg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-primary-text">Review #{review.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-text">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-semibold text-japan-red">{review.totalScore} pts</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
