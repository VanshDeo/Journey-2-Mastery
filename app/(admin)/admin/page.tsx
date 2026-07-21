'use client';

import { useAdminDashboard, useAdminActivity } from '@/hooks/queries/useAdminDashboard';
import UnassignedQueueAlert from '@/components/admin/UnassignedQueueAlert';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Scale, ListChecks, Send, BarChart3, Castle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();
  const { data: activity } = useAdminActivity();

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const stats = [
    { label: 'Total Warriors', value: data.totalUsers, icon: Users, color: 'bg-sky-50 text-sky-600 border-sky-100', href: '/admin/users' },
    { label: 'Total Masters', value: data.totalJudges, icon: Scale, color: 'bg-purple-50 text-purple-600 border-purple-100', href: '/admin/judges' },
    { label: 'Active Trials', value: data.totalTasks, icon: ListChecks, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', href: '/admin/tasks' },
    { label: 'Submissions', value: data.totalSubmissions, icon: Send, color: 'bg-amber-50 text-amber-600 border-amber-100', href: '/admin/submissions' },
  ];

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
              <Castle className="h-10 w-10 text-japan-red" />
              Shogun&apos;s Palace
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Oversee the entire realm and its inhabitants.</p>
          </div>
        </div>
      </div>

      <UnassignedQueueAlert />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="hover:shadow-md transition-shadow border-borders bg-white/80 group-hover:border-japan-red/40 h-full">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-text font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-primary-text font-serif">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Status Breakdown */}
          {data.statusBreakdown && data.statusBreakdown.length > 0 && (
            <Card className="border-borders shadow-sm bg-white/80">
              <CardHeader className="border-b border-borders/50 bg-card-bg">
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-japan-red" />
                  Submission Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {data.statusBreakdown.map((item) => (
                    <div key={item.status} className="text-center p-5 rounded-xl border border-borders bg-white shadow-sm">
                      <p className="text-3xl font-bold text-primary-text font-serif">{item.count}</p>
                      <p className="text-xs text-secondary-text font-bold tracking-wider uppercase mt-2">{item.status.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Performers */}
          {data.topPerformers && data.topPerformers.length > 0 && (
            <Card className="border-borders shadow-sm bg-white/80">
              <CardHeader className="border-b border-borders/50 bg-card-bg">
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <NinjaStarIcon className="h-5 w-5 text-japan-red" />
                  Legendary Warriors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {data.topPerformers.map((p, i) => (
                    <Link key={p.userId} href={`/admin/users/${p.userId}`} className="flex items-center justify-between p-4 rounded-xl border border-borders bg-white hover:border-japan-red/40 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <span className="text-base font-bold text-muted-text w-6 text-center font-serif">{i + 1}</span>
                        <span className="text-sm font-bold text-primary-text group-hover:text-japan-red transition-colors">{p.userName}</span>
                      </div>
                      <span className="text-sm font-bold text-japan-red bg-red-50 px-3 py-1 rounded-full">{p.score} pts</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-8">
          {activity?.activities && activity.activities.length > 0 && (
            <Card className="border-borders shadow-sm bg-white/80 h-full">
              <CardHeader className="border-b border-borders/50 bg-card-bg">
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-japan-red" />
                  Realm Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {activity.activities.slice(0, 15).map((a) => (
                    <div key={a.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary-bg transition-colors">
                      <span className="text-xs font-mono text-muted-text shrink-0 w-24 pt-0.5">{new Date(a.timestamp).toLocaleDateString()}</span>
                      <span className="text-sm font-medium text-secondary-text leading-snug">{a.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
