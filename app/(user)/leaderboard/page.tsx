'use client';

import { useLeaderboard } from '@/hooks/queries/useLeaderboard';
import { useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const { data: entries, isLoading, isError, error, refetch } = useLeaderboard();
  const { data: currentUser } = useSession();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
          <Trophy className="h-7 w-7 text-japan-red" />
          Leaderboard
        </h1>
        <p className="text-secondary-text mt-1">Rankings updated every 30 seconds.</p>
      </div>

      {/* Top 3 podium */}
      {entries && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const position = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ['h-28', 'h-36', 'h-24'];
            return (
              <Card key={entry.userId} className={cn('text-center', position === 1 && 'border-japan-red/30')}>
                <CardContent className={cn('pt-6 flex flex-col items-center justify-end', heights[i])}>
                  <Avatar className="h-12 w-12 mb-2">
                    {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                    <AvatarFallback>{entry.userName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm text-primary-text truncate w-full">{entry.userName}</p>
                  <p className="text-xl font-bold text-japan-red">{entry.score}</p>
                  <span className="text-xs text-muted-text">#{position}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.map((entry) => (
                <TableRow
                  key={entry.userId}
                  className={cn(
                    currentUser?.id === entry.userId && 'bg-japan-red/5 border-l-2 border-l-japan-red'
                  )}
                >
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7">
                        {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                        <AvatarFallback className="text-xs">{entry.userName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className={cn('text-sm', currentUser?.id === entry.userId && 'font-semibold')}>
                        {entry.userName}
                        {currentUser?.id === entry.userId && <span className="text-xs text-muted-text ml-1">(You)</span>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell><RankBadge rank={entry.userRank} size="sm" /></TableCell>
                  <TableCell className="text-right font-semibold">{entry.score}</TableCell>
                  <TableCell className="text-right text-muted-text">{entry.tasksCompleted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
