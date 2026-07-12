'use client';

import { useAdminLeaderboard, useRecalculateLeaderboard } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, RefreshCw } from 'lucide-react';
import { apiDownloadUrl } from '@/lib/api-client';

export default function AdminLeaderboardPage() {
  const { data: entries, isLoading, isError, error, refetch } = useAdminLeaderboard();
  const recalculate = useRecalculateLeaderboard();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
          <Trophy className="h-7 w-7 text-japan-red" />Leaderboard Management
        </h1>
        <div className="flex gap-2">
          <a href={apiDownloadUrl('/admin/leaderboard/export')} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">Export CSV</Button>
          </a>
          <Button variant="outline" size="sm" onClick={() => recalculate.mutate()} disabled={recalculate.isPending}>
            <RefreshCw className="h-4 w-4 mr-1" />{recalculate.isPending ? 'Recalculating...' : 'Recalculate'}
          </Button>
        </div>
      </div>

      {entries && entries.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead className="w-16">#</TableHead><TableHead>Player</TableHead><TableHead>Rank</TableHead><TableHead className="text-right">Score</TableHead><TableHead className="text-right">Tasks</TableHead></TableRow></TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.userId}>
                    <TableCell className="font-medium">{e.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{e.userName?.charAt(0)}</AvatarFallback></Avatar>
                        <span className="text-sm">{e.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell><RankBadge rank={e.userRank} size="sm" /></TableCell>
                    <TableCell className="text-right font-semibold">{e.score}</TableCell>
                    <TableCell className="text-right text-muted-text">{e.tasksCompleted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-text text-center py-8">No leaderboard data.</p>
      )}
    </div>
  );
}
