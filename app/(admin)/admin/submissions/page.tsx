'use client';

import { useState } from 'react';
import { useAdminSubmissions, useAssignJudge } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminSubmissionsPage() {
  const [status, setStatus] = useState('');
  const { data: submissions, isLoading, isError, error, refetch } = useAdminSubmissions({ status: status || undefined });
  const assignJudge = useAssignJudge();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-primary-text">Submissions</h1>
        <Link href="/admin/submissions/unassigned">
          <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-1" />Unassigned Queue</Button>
        </Link>
      </div>

      <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {!submissions || submissions.length === 0 ? (
        <EmptyState icon="inbox" title="No submissions" message="No submissions match the selected filter." />
      ) : (
        <div className="border border-borders rounded-lg overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Judge</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Link href={`/admin/submissions/${s.id}`} className="text-sm font-medium hover:text-japan-red">{s.taskTitle || 'Submission'}</Link></TableCell>
                  <TableCell className="text-sm text-secondary-text">{s.userName || 'Unknown'}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-sm text-muted-text">
                    {s.judgeName || (
                      <Button variant="outline" size="sm" onClick={() => assignJudge.mutate({ submissionId: s.id }, { onSuccess: () => { toast.success('Judge assigned'); refetch(); } })}>
                        <UserPlus className="h-3 w-3 mr-1" />Assign
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-japan-red">{s.score ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
