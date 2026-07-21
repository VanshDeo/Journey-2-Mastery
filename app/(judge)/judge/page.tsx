'use client';

import { useJudgeDashboard, useJudgeWorkload } from '@/hooks/queries/useJudgeQueue';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckCircle2, Clock, BarChart3, Scale } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function JudgeDashboard() {
  const { data: user } = useSession();
  const { data, isLoading, isError, error, refetch } = useJudgeDashboard();
  const { data: workload } = useJudgeWorkload();

  if (isLoading) return <LoadingSkeleton variant="dashboard" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

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
              <Scale className="h-10 w-10 text-japan-red" />
              Master&apos;s Tribunal
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Welcome, Master {user?.fullName || user?.username}. Evaluate the disciples.</p>
          </div>
          <Link href="/judge/queue">
            <Button className="bg-japan-red hover:bg-dark-red text-white shadow-sm font-bold text-base px-6 py-5 rounded-full">
              Enter Queue →
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade">
        <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 shadow-sm">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Reviewed</p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.reviewedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Turnaround</p>
              <p className="text-2xl font-bold text-primary-text font-serif">{data.avgTurnaround || '—'}</p>
            </div>
          </CardContent>
        </Card>

        {workload && (
          <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 shadow-sm">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Load Score</p>
                <p className="text-2xl font-bold text-primary-text font-serif">{workload.loadScore}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Reviews */}
      <Card className="border-borders shadow-sm bg-white/80">
        <CardHeader className="border-b border-borders/50 bg-card-bg">
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <NinjaStarIcon className="w-5 h-5 text-japan-red" />
            Recent Judgments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!data.recentReviews || data.recentReviews.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 rounded-full bg-secondary-bg flex items-center justify-center mb-4 border border-borders shadow-sm">
                <Scale className="h-8 w-8 text-primary-text/40" />
              </div>
              <p className="font-bold text-primary-text text-lg mb-1">No judgments yet</p>
              <p className="text-sm text-secondary-text">Your recent evaluations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentReviews.slice(0, 5).map((review) => (
                <Link key={review.id} href={`/judge/reviews/${review.id}`} className="block group">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-borders bg-white hover:border-japan-red/40 hover:shadow-md transition-all">
                    <div>
                      <p className="text-sm font-bold text-primary-text group-hover:text-japan-red transition-colors flex items-center gap-2">
                        <NinjaStarIcon className="w-3.5 h-3.5 text-japan-red opacity-0 group-hover:opacity-100 transition-opacity" />
                        Judgment #{review.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-secondary-text mt-1 pl-5 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-bold text-japan-red bg-red-50 px-3 py-1 rounded-full">{review.totalScore} pts</span>
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
