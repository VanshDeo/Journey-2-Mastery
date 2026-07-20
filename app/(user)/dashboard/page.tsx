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
import { Trophy, ListChecks, Clock, Star, ArrowRight, Activity, CircleDashed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

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

  const ranks = [
    { name: 'Ronin', pts: 0, icon: Star, desc: 'Ronin is the first level of Journey to Mastery. You have no backend, no database, no auth. Just you, a browser, and a blank canvas.', diff: 'Easy' },
    { name: 'Kenshi', pts: 100, icon: Trophy, desc: 'You have proven yourself worthy. Now you must master the fundamental structures of the web and components.', diff: 'Medium' },
    { name: 'Samurai', pts: 200, icon: ListChecks, desc: 'A true warrior. You now wield the power of databases and servers with precision.', diff: 'Hard' },
    { name: 'Shogun', pts: 300, icon: Star, desc: 'Master of the domain. Your architecture is flawless and your code is legendary.', diff: 'Master' },
  ];

  const currentRankName = user?.rank || 'Ronin';
  const currentRankIndex = ranks.findIndex(r => r.name === currentRankName);
  const currentRankData = ranks[currentRankIndex !== -1 ? currentRankIndex : 0];
  const nextRank = currentRankIndex < ranks.length - 1 ? ranks[currentRankIndex + 1] : null;
  const rankProgressPercent = currentRankIndex === -1 ? 0 : (currentRankIndex / (ranks.length - 1)) * 100;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-10 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply scale-105 grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm relative inline-block">
              Welcome back, {user?.fullName?.split(' ')[0] || user?.username}
              <svg className="absolute -bottom-4 left-0 w-full h-4 text-japan-red" viewBox="0 0 200 10" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5 Q 50 10, 100 5 T 199 5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Here&apos;s your progress overview.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-borders flex items-center gap-3">
             <NinjaStarIcon className="w-5 h-5 text-japan-red" />
             <span className="font-bold text-lg">{user?.rank || 'Ronin'}</span>
          </div>
        </div>
      </div>

      {/* Rank Progress Timeline */}
      <Card className="overflow-hidden border-borders shadow-sm bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <NinjaStarIcon className="w-6 h-6 text-japan-red" />
            <h2 className="font-serif text-xl font-bold text-primary-text">Rank Progress</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <p className="text-sm text-secondary-text">Complete tasks and earn points to level up.</p>
            <div className="flex items-center gap-4 text-xs font-bold text-muted-text uppercase tracking-wider">
              <span>{currentRankIndex >= 0 ? ranks[currentRankIndex].pts : 0} / {ranks[Math.min(currentRankIndex + 1, ranks.length - 1)]?.pts || 5000} pts</span>
              <span>{Math.round(rankProgressPercent)}%</span>
            </div>
          </div>
          
          <div className="relative w-full max-w-5xl mx-auto py-8">
            {/* Background Line (inset to match the center of the first and last nodes) */}
            <div className="absolute top-[56px] left-12 right-12 z-0">
              <div className="w-full h-1 bg-borders -translate-y-1/2 rounded-full" />
              <div className="absolute top-0 left-0 h-1 bg-japan-red -translate-y-1/2 rounded-full transition-all duration-1000" style={{ width: `${rankProgressPercent}%` }} />
            </div>
            
            <div className="relative flex justify-between z-10">
              {ranks.map((rank, i) => {
                const isActive = i <= currentRankIndex;
                const Icon = rank.icon;
                return (
                  <div key={rank.name} className="flex flex-col items-center w-24 shrink-0">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors bg-white mb-3", isActive ? "border-japan-red text-japan-red shadow-sm" : "border-borders text-muted-text")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center w-full">
                      <p className={cn("font-bold text-sm", isActive ? "text-japan-red" : "text-secondary-text")}>{rank.name}</p>
                      <p className="text-xs text-muted-text mt-0.5">{i === currentRankIndex ? 'Current Rank' : `${rank.pts} pts`}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-fade">
        <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <NinjaStarIcon className="h-6 w-6 text-japan-red" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-text uppercase tracking-wider">Total Score</p>
              <p className="text-2xl font-bold text-primary-text">{data.totalScore || 0}</p>
              <p className="text-xs text-secondary-text mt-0.5">Points earned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <ListChecks className="h-6 w-6 text-japan-red" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-text uppercase tracking-wider">Tasks Completed</p>
              <p className="text-2xl font-bold text-primary-text">{data.tasksCompleted || 0}</p>
              <p className="text-xs text-secondary-text mt-0.5">Keep going!</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-text uppercase tracking-wider">Pending Reviews</p>
              <p className="text-2xl font-bold text-primary-text">
                {submissions?.filter(sub => sub.status === 'pending' || sub.status === 'in_review').length ?? 0}
              </p>
              <p className="text-xs text-secondary-text mt-0.5">Awaiting feedback</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-borders bg-white/80">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-bg flex items-center justify-center shrink-0">
              <Trophy className="h-6 w-6 text-primary-text" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-text uppercase tracking-wider">Tasks Available</p>
              <p className="text-2xl font-bold text-primary-text">{data.tasksAvailable ?? '—'}</p>
              <p className="text-xs text-secondary-text mt-0.5">Start your next task</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Journey */}
          <Card className="border-borders shadow-sm bg-white/80 overflow-hidden relative">
            <CardHeader className="border-b border-borders/50 bg-card-bg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NinjaStarIcon className="w-6 h-6 text-japan-red" />
                  <CardTitle className="font-serif text-xl">Continue Your Journey</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 relative">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-japan-red" />
              <div className="flex flex-col md:flex-row items-center gap-8 pl-4">
                 <div className="w-32 h-32 rounded-full bg-white border border-borders shadow-sm shrink-0 overflow-hidden relative">
                    <Image src="/images/avatar-ronin.png" alt="Ronin" fill className="object-contain p-2" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-2xl font-bold text-primary-text">{currentRankData.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">{currentRankData.diff}</span>
                    </div>
                    <p className="text-sm text-secondary-text mb-4 max-w-lg leading-relaxed">
                      {currentRankData.desc}
                    </p>
                    <div className="flex items-center gap-6">
                      <span className="font-serif text-xl font-bold text-japan-red">{nextRank ? `${nextRank.pts} pts` : 'MAX'}</span>
                      <Link href="/tasks">
                        <button className="px-6 py-2 rounded-full border-2 border-japan-red text-japan-red font-bold hover:bg-japan-red hover:text-white transition-colors flex items-center gap-2 text-sm">
                          View Tasks <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Overview */}
          <Card className="border-borders shadow-sm bg-white/80">
            <CardHeader className="border-b border-borders/50">
               <div className="flex items-center gap-2">
                  <NinjaStarIcon className="w-6 h-6 text-japan-red" />
                  <CardTitle className="font-serif text-xl">Tasks Overview</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-8 flex items-center gap-12">
               <div className="relative w-32 h-32 shrink-0">
                 {(() => {
                    const available = data.tasksAvailable ?? 1;
                    const completed = data.tasksCompleted ?? 0;
                    const inProgress = submissions?.filter(sub => sub.status === 'pending' || sub.status === 'in_review').length ?? 0;
                    const total = (available + completed + inProgress) || 1;
                    
                    const r = 40;
                    const circ = 2 * Math.PI * r;
                    
                    const availPct = available / total;
                    const inProgPct = inProgress / total;
                    const compPct = completed / total;

                    const availRot = -90;
                    const inProgRot = availRot + (availPct * 360);
                    const compRot = inProgRot + (inProgPct * 360);

                    return (
                      <>
                        <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 100 100">
                          {/* Background Track */}
                          <circle cx="50" cy="50" r={r} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary-bg" />
                          
                          {/* Available (Black) */}
                          <circle cx="50" cy="50" r={r} stroke="#111111" strokeWidth="12" fill="transparent" className="transition-all duration-1000" 
                            strokeDasharray={`${availPct * circ} ${circ}`} 
                            transform={`rotate(${availRot} 50 50)`} 
                          />
                          
                          {/* In Progress (Gold) */}
                          <circle cx="50" cy="50" r={r} stroke="#D4AF37" strokeWidth="12" fill="transparent" className="transition-all duration-1000" 
                            strokeDasharray={`${inProgPct * circ} ${circ}`} 
                            transform={`rotate(${inProgRot} 50 50)`} 
                          />
                          
                          {/* Completed (Red) */}
                          <circle cx="50" cy="50" r={r} stroke="#B93A32" strokeWidth="12" fill="transparent" className="transition-all duration-1000" 
                            strokeDasharray={`${compPct * circ} ${circ}`} 
                            transform={`rotate(${compRot} 50 50)`} 
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-bold text-primary-text">{total}</span>
                           <span className="text-xs font-semibold text-muted-text">Total</span>
                        </div>
                      </>
                    )
                 })()}
               </div>
               <div className="flex-1 space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#111111' }} /> Available</div>
                   <span className="font-bold text-lg">{data.tasksAvailable ?? 1}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#D4AF37' }} /> In Progress</div>
                   <span className="font-bold text-lg">{submissions?.filter(sub => sub.status === 'pending' || sub.status === 'in_review').length ?? 0}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: '#B93A32' }} /> Completed</div>
                   <span className="font-bold text-lg">{data.tasksCompleted ?? 0}</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Recent Submissions */}
          <Card className="border-borders shadow-sm bg-white/80">
            <CardHeader className="border-b border-borders/50">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <NinjaStarIcon className="w-6 h-6 text-japan-red" />
                    <CardTitle className="font-serif text-xl">Recent Submissions</CardTitle>
                  </div>
                  <Link href="/submissions" className="text-xs font-bold text-japan-red hover:underline">View All →</Link>
                </div>
            </CardHeader>
            <CardContent className="p-4">
              {submissionsLoading ? (
                <div className="space-y-2"><div className="h-10 bg-borders animate-pulse rounded" /></div>
              ) : !submissions || submissions.length === 0 ? (
                <EmptyState icon="inbox" message="No submissions yet." />
              ) : (
                <div className="space-y-2">
                  {submissions.slice(0, 3).map((sub) => (
                    <Link key={sub.id} href={`/submissions/${sub.id}`} className="block">
                      <div className="p-4 rounded-xl border-l-4 border-japan-red bg-card-bg hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-primary-text">{sub.taskTitle || 'Task Submission'}</p>
                          <StatusBadge status={sub.status} />
                        </div>
                        <p className="text-xs text-muted-text truncate">{sub.repoName || sub.repoUrl}</p>
                        <p className="text-xs text-secondary-text mt-1">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-borders shadow-sm bg-white/80">
            <CardHeader className="border-b border-borders/50">
               <div className="flex items-center gap-2">
                 <NinjaStarIcon className="w-6 h-6 text-japan-red" />
                 <CardTitle className="font-serif text-xl">Recent Activity</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {(!submissions || submissions.length === 0) ? (
                <div className="text-sm text-muted-text text-center py-4">No recent activity.</div>
              ) : (
                submissions.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border", 
                      sub.status === 'approved' ? "bg-red-50 text-japan-red border-japan-red/20" :
                      sub.status === 'rejected' ? "bg-secondary-bg text-primary-text border-borders" :
                      "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20"
                    )}>
                      {sub.status === 'approved' ? <ListChecks className="w-5 h-5" /> : 
                       sub.status === 'rejected' ? <Activity className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-text truncate">
                        {sub.status === 'approved' ? 'Submission approved!' : 
                         sub.status === 'rejected' ? 'Submission rejected' :
                         'Submission pending review'}
                      </p>
                      <p className="text-xs text-muted-text truncate">{sub.taskTitle || 'Unknown Task'}</p>
                    </div>
                    <span className="text-xs text-muted-text whitespace-nowrap">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Inspirational Banner */}
          <Card className="overflow-hidden border-borders shadow-sm relative h-[200px] bg-white group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
            <div className="absolute inset-0 z-0 opacity-80 mix-blend-multiply flex justify-end">
              <Image src="/images/ninja-kneeling.png" alt="Ninja" width={300} height={200} className="object-contain object-right-bottom group-hover:scale-105 transition-transform duration-700 grayscale contrast-125 brightness-110" />
            </div>
            <div className="relative z-20 p-6 h-full flex flex-col justify-center max-w-[200px]">
              <h3 className="font-marker text-2xl font-bold text-primary-text leading-tight mb-2 uppercase">
                DISCIPLINE TODAY, <br/><span className="text-japan-red">MASTERY TOMORROW.</span>
              </h3>
              <div className="w-12 h-1 bg-japan-red rounded-full mt-2" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
