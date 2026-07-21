'use client';

import { useParams } from 'next/navigation';
import { useSubmission, useWithdrawSubmission } from '@/hooks/queries/useSubmissions';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import StatusBadge from '@/components/shared/StatusBadge';
import CommentThread from '@/components/shared/CommentThread';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: submission, isLoading, isError, error, refetch } = useSubmission(id);
  const withdrawMutation = useWithdrawSubmission();

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!submission) return null;

  const handleWithdraw = () => {
    withdrawMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Submission withdrawn');
        router.push('/submissions');
      },
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/submissions" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Submissions
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-text">{submission.taskTitle || 'Submission'}</h1>
          <p className="text-sm text-muted-text mt-1">Submitted {new Date(submission.submittedAt).toLocaleDateString()}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <Separator />

      {/* Repo Link */}
      <Card>
        <CardContent className="pt-6">
          <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-japan-red hover:text-dark-red font-medium transition-colors">
            <ExternalLink className="h-4 w-4" />
            {submission.repoUrl.replace('https://github.com/', '')}
          </a>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      {submission.review && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-japan-red" />
              Review — {submission.review.totalScore} points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submission.review.scores.map((s) => (
                <div key={s.criterionId} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-text">{s.criterionName}</span>
                  <span className="text-sm font-medium">{s.score} / {s.maxScore}</span>
                </div>
              ))}
            </div>
            {submission.review.feedback && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm font-medium text-primary-text mb-1">Feedback</p>
                  <p className="text-sm text-secondary-text whitespace-pre-wrap">{submission.review.feedback}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {submission.status === 'pending' && (
        <div className="flex gap-3">
          <ConfirmDialog
            trigger={<Button variant="destructive" size="sm">Withdraw</Button>}
            title="Withdraw Submission?"
            description="This will permanently remove your submission. You can re-submit later."
            confirmLabel="Withdraw"
            variant="destructive"
            onConfirm={handleWithdraw}
            isPending={withdrawMutation.isPending}
          />
        </div>
      )}

      <Separator />

      {/* Comments */}
      <CommentThread submissionId={id} />
    </div>
  );
}
