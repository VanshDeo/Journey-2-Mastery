'use client';

import { useParams } from 'next/navigation';
import { useAdminUser, useJudgePerformance } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, Clock, ListChecks, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminJudgeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading: uLoading } = useAdminUser(id);
  const { data: perf, isLoading: pLoading, isError, error, refetch } = useJudgePerformance(id);

  if (uLoading || pLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/judges" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Judges
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
            <AvatarFallback className="text-xl">{(user.fullName || user.username)?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-text">{user.fullName || user.username}</h1>
            <p className="text-sm text-muted-text">@{user.username}</p>
          </div>
        </div>
      )}

      {perf && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Reviews', value: perf.totalReviews, icon: ListChecks },
            { label: 'Avg Score Given', value: perf.avgScoreGiven?.toFixed(1), icon: Star },
            { label: 'Avg Turnaround', value: `${perf.avgTurnaroundHours?.toFixed(1)}h`, icon: Clock },
            { label: 'Pending', value: perf.pendingCount, icon: BarChart3 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="pt-6 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-japan-red" />
                  <div>
                    <p className="text-xs text-muted-text">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
