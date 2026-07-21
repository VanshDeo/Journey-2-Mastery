'use client';

import { useUnassignedSubmissions, useReassignSubmission } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminUnassignedPage() {
  const { data: submissions, isLoading, isError, error, refetch } = useUnassignedSubmissions();
  const reassign = useReassignSubmission();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <Link href="/admin/submissions" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Submissions
      </Link>
      <h1 className="font-serif text-3xl font-bold text-primary-text">Unassigned Submissions</h1>

      {!submissions || submissions.length === 0 ? (
        <EmptyState icon="inbox" title="All assigned!" message="No submissions are waiting for a judge." />
      ) : (
        <div className="border border-borders rounded-lg overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>User</TableHead><TableHead>Submitted</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Link href={`/admin/submissions/${s.id}`} className="text-sm font-medium hover:text-japan-red">{s.taskTitle || 'Submission'}</Link></TableCell>
                  <TableCell className="text-sm text-secondary-text">{s.userName || 'Unknown'}</TableCell>
                  <TableCell className="text-sm text-muted-text">{new Date(s.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => reassign.mutate({ submissionId: s.id }, { onSuccess: () => { toast.success('Judge assigned'); refetch(); } })} disabled={reassign.isPending}>
                      <UserPlus className="h-3 w-3 mr-1" />Assign
                    </Button>
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
