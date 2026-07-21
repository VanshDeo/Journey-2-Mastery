'use client';

import { useAdminJudges, usePromoteJudge, useDemoteJudge } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMinus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminJudgesPage() {
  const { data: judges, isLoading, isError, error, refetch } = useAdminJudges();
  const demoteJudge = useDemoteJudge();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary-text">Judges</h1>

      {!judges || judges.length === 0 ? (
        <EmptyState icon="users" title="No judges" message="Promote users to judge role from the Users page." />
      ) : (
        <div className="border border-borders rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judge</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Load Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {judges.map((j) => (
                <TableRow key={j.id}>
                  <TableCell>
                    <Link href={`/admin/judges/${j.id}`} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {j.avatarUrl && <AvatarImage src={j.avatarUrl} />}
                        <AvatarFallback className="text-xs">{(j.fullName || j.username)?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{j.fullName || j.username}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{j.workload?.assignedCount ?? '—'}</TableCell>
                  <TableCell>{j.workload?.completedCount ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={j.workload && j.workload.loadScore > 8 ? 'destructive' : 'secondary'}>
                      {j.workload?.loadScore ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog
                      trigger={<Button variant="ghost" size="sm"><UserMinus className="h-4 w-4 mr-1" />Demote</Button>}
                      title="Demote Judge?"
                      description={`This will remove judge privileges from ${j.fullName || j.username}.`}
                      confirmLabel="Demote"
                      variant="destructive"
                      onConfirm={() => demoteJudge.mutate(j.id, { onSuccess: () => toast.success('Judge demoted') })}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
