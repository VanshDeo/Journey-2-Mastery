'use client';

import { useUserDashboard } from '@/hooks/queries/useUser';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import RankBadge from '@/components/shared/RankBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, ListChecks, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function UserDashboard() {
  const { data: user } = useSession();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useUserDashboard();
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();

  useEffect(() => {
    if (user) {
      const userRole = user.role?.trim();
      if (userRole === 'admin') router.push('/admin');
      else if (userRole === 'judge') router.push('/judge');
    }
  }, [user, router]);

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <EmptyState message="Failed to load dashboard data." />;

  return (
    <div className="space-y-8">
      {/* Welcome + Rank */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">
            Welcome back, {user?.fullName?.split(' ')[0] || user?.username}
          </h1>
          <p className="text-secondary-text mt-1">Here&apos;s your progress overview.</p>
        </div>
        {user?.rank && <RankBadge rank={user.rank} size="lg" />}
      </div>

      {/* Rank Progress */}
      {(() => {
        const totalActive = (data.tasksCompleted || 0) + (data.tasksAvailable || 0);
        const rankProgress = totalActive > 0 ? Math.round(((data.tasksCompleted || 0) / totalActive) * 100) : 0;
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-secondary-text">Rank Progress</span>
                <span className="text-sm text-muted-text">{rankProgress}%</span>
              </div>
              <Progress value={rankProgress} />
            </CardContent>
          </Card>
        );
      })()}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-japan-red/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-japan-red" />
              </div>
              <div>
                <p className="text-xs text-muted-text">Total Score</p>
                <p className="text-2xl font-bold text-primary-text">{data.totalScore || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ListChecks className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-text">Tasks Completed</p>
                <p className="text-2xl font-bold text-primary-text">{data.tasksCompleted || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-text">Pending Reviews</p>
                <p className="text-2xl font-bold text-primary-text">
                  {submissions?.filter(sub => sub.status === 'pending' || sub.status === 'in_review').length ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-muted-text">Tasks Available</p>
                <p className="text-2xl font-bold text-primary-text">{data.tasksAvailable ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3">
        <Link href="/tasks" className="text-sm font-medium text-japan-red hover:text-dark-red transition-colors">
          Browse Tasks →
        </Link>
        <Link href="/submissions" className="text-sm font-medium text-japan-red hover:text-dark-red transition-colors">
          My Submissions →
        </Link>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-secondary-bg animate-pulse rounded" />
              <div className="h-10 bg-secondary-bg animate-pulse rounded" />
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <EmptyState icon="inbox" message="You haven't submitted any tasks yet." actionLabel="Browse Tasks" onAction={() => window.location.href = '/tasks'} />
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 3).map((sub) => (
                <Link key={sub.id} href={`/submissions/${sub.id}`} className="block">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-borders bg-card-bg hover:bg-secondary-bg hover:border-japan-red/20 transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-primary-text truncate">{sub.taskTitle || sub.repoName || 'Submission'}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
