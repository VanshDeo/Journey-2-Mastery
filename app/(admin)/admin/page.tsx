'use client';

import { useAdminDashboard, useAdminActivity } from '@/hooks/queries/useAdminDashboard';
import UnassignedQueueAlert from '@/components/admin/UnassignedQueueAlert';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Scale, ListChecks, Send, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();
  const { data: activity } = useAdminActivity();

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'bg-sky-100 text-sky-600', href: '/admin/users' },
    { label: 'Total Judges', value: data.totalJudges, icon: Scale, color: 'bg-purple-100 text-purple-600', href: '/admin/judges' },
    { label: 'Active Tasks', value: data.totalTasks, icon: ListChecks, color: 'bg-emerald-100 text-emerald-600', href: '/admin/tasks' },
    { label: 'Total Submissions', value: data.totalSubmissions, icon: Send, color: 'bg-amber-100 text-amber-600', href: '/admin/submissions' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold text-primary-text">Admin Dashboard</h1>

      <UnassignedQueueAlert />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-text">{stat.label}</p>
                    <p className="text-2xl font-bold text-primary-text">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Status Breakdown */}
      {data.statusBreakdown && data.statusBreakdown.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-japan-red" />Submission Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.statusBreakdown.map((item) => (
                <div key={item.status} className="text-center p-4 rounded-lg bg-secondary-bg">
                  <p className="text-2xl font-bold text-primary-text">{item.count}</p>
                  <p className="text-xs text-muted-text capitalize mt-1">{item.status.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {data.topPerformers && data.topPerformers.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Top Performers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPerformers.map((p, i) => (
                <Link key={p.userId} href={`/admin/users/${p.userId}`} className="flex items-center justify-between p-3 rounded-lg border border-borders hover:bg-secondary-bg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-text w-6">#{i + 1}</span>
                    <span className="text-sm font-medium text-primary-text">{p.userName}</span>
                  </div>
                  <span className="text-sm font-semibold text-japan-red">{p.score} pts</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {activity?.activities && activity.activities.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.activities.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-muted-text shrink-0 w-24">{new Date(a.timestamp).toLocaleDateString()}</span>
                  <span className="text-secondary-text">{a.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
