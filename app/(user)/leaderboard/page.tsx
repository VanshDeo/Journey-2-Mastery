'use client';

import { useLeaderboard } from '@/hooks/queries/useLeaderboard';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Crown, Medal, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function LeaderboardPage() {
  const { data: entries, isLoading, isError, error, refetch } = useLeaderboard();
  const { data: currentUser } = useSession();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-12 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <NinjaStarIcon className="h-10 w-10 text-japan-red" />
              Hall of Masters
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Top warriors ranked by honor and glory. Rankings update every 30 seconds.</p>
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      {entries && entries.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-12 max-w-4xl mx-auto px-4">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const position = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ['h-[280px]', 'h-[340px]', 'h-[250px]'];
            const colors = [
              'bg-[#E6E8FA] border-[#C0C0C0]', // Silver
              'bg-[#FFF5D1] border-[#FFD700]', // Gold
              'bg-[#F5E6D3] border-[#CD7F32]'  // Bronze
            ];
            const textColors = ['text-[#707070]', 'text-[#B8860B]', 'text-[#8B4513]'];
            const Icons = [Medal, Crown, Swords];
            const PosIcon = Icons[i];

            return (
              <div key={entry.userId} className={cn('relative flex flex-col items-center justify-end group', position === 1 ? 'z-10 -translate-y-4 md:-translate-y-8' : 'z-0')}>
                <div className="mb-6 flex flex-col items-center">
                  <div className="relative">
                    <Avatar className={cn("border-4 shadow-xl transition-transform duration-500 group-hover:scale-110", position === 1 ? "h-28 w-28 border-[#FFD700]" : "h-20 w-20 border-white")}>
                      {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                      <AvatarFallback className="text-2xl">{entry.userName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {position === 1 && (
                      <div className="absolute -top-6 -right-4 text-[#FFD700] drop-shadow-lg">
                        <Crown className="w-10 h-10 fill-current animate-bounce" />
                      </div>
                    )}
                  </div>
                  <p className="font-bold text-lg text-primary-text truncate w-full mt-4 text-center">{entry.userName}</p>
                  <div className="flex items-center gap-1 mt-1 bg-white px-3 py-1 rounded-full shadow-sm border border-borders">
                     <NinjaStarIcon className="w-3 h-3 text-japan-red" />
                     <span className="text-sm font-bold text-japan-red">{entry.score} pts</span>
                  </div>
                </div>
                
                <Card className={cn('w-full border-t-8 rounded-t-2xl rounded-b-none shadow-lg overflow-hidden transition-all duration-300', heights[i], colors[i])}>
                  <CardContent className="p-0 h-full flex flex-col items-center justify-start pt-8 relative">
                    <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px', color: 'black' }} />
                    <PosIcon className={cn("w-16 h-16 opacity-20 mb-4", textColors[i])} />
                    <span className={cn("text-7xl font-bold opacity-30 font-serif", textColors[i])}>#{position}</span>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <Card className="border-borders shadow-sm bg-white/80 overflow-hidden mt-8">
        <CardHeader className="border-b border-borders/50 bg-card-bg flex flex-row items-center justify-between py-4 px-6">
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Swords className="w-5 h-5 text-japan-red" />
            Global Rankings
          </CardTitle>
          <div className="px-3 py-1 bg-japan-red/10 text-japan-red rounded-full text-xs font-bold uppercase tracking-wider">
            {entries?.length || 0} Warriors
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary-bg/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20 text-center font-bold">Rank</TableHead>
                <TableHead className="font-bold">Warrior</TableHead>
                <TableHead className="font-bold">Title</TableHead>
                <TableHead className="text-right font-bold">Honor Points</TableHead>
                <TableHead className="text-right font-bold">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.map((entry) => (
                <TableRow
                  key={entry.userId}
                  className={cn(
                    "transition-colors",
                    currentUser?.id === entry.userId ? 'bg-japan-red/5 border-l-4 border-l-japan-red shadow-[inset_0_0_20px_rgba(185,58,50,0.05)]' : 'hover:bg-secondary-bg/50'
                  )}
                >
                  <TableCell className="font-bold text-center">
                    {entry.rank <= 3 ? (
                      <span className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold",
                        entry.rank === 1 ? "bg-gradient-to-br from-[#FFD700] to-[#DAA520] shadow-md" :
                        entry.rank === 2 ? "bg-gradient-to-br from-[#C0C0C0] to-[#A9A9A9] shadow-md" :
                        "bg-gradient-to-br from-[#CD7F32] to-[#8B4513] shadow-md"
                      )}>
                        {entry.rank}
                      </span>
                    ) : (
                      <span className="text-muted-text font-serif text-lg">#{entry.rank}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className={cn("h-10 w-10 border-2", currentUser?.id === entry.userId ? 'border-japan-red' : 'border-borders')}>
                        {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                        <AvatarFallback className="font-bold">{entry.userName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className={cn('text-sm', currentUser?.id === entry.userId ? 'font-bold text-japan-red' : 'font-semibold text-primary-text')}>
                          {entry.userName}
                        </span>
                        {currentUser?.id === entry.userId && <span className="text-[10px] text-japan-red/80 uppercase tracking-wider font-bold">You</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><RankBadge rank={entry.userRank} size="sm" /></TableCell>
                  <TableCell className="text-right font-bold text-primary-text">
                    <div className="flex items-center justify-end gap-1.5">
                      <NinjaStarIcon className="w-4 h-4 text-japan-red opacity-70" />
                      {entry.score}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-text font-medium">{entry.tasksCompleted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
