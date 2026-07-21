'use client';

import { useParams, useRouter } from 'next/navigation';
import { useJudgeSubmission, useSubmitReview } from '@/hooks/queries/useJudgeQueue';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import StatusBadge from '@/components/shared/StatusBadge';
import CommentThread from '@/components/shared/CommentThread';
import ScoreRubricForm from '@/components/judge/ScoreRubricForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function JudgeSubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: submission, isLoading, isError, error, refetch } = useJudgeSubmission(id);
  const submitReview = useSubmitReview();

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!submission) return null;

  const handleReviewSubmit = (scores: { criterionId: string; score: number }[], feedback: string) => {
    submitReview.mutate(
      { submissionId: id, scores, feedback },
      {
        onSuccess: () => {
          toast.success('Review submitted successfully!');
          router.push('/judge/queue');
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/judge/queue" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Queue
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-text">{submission.taskTitle || 'Submission Review'}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-sm text-secondary-text">
              <User className="h-4 w-4" /> {submission.userName || 'Unknown'}
            </div>
            <span className="text-muted-text text-xs">·</span>
            <span className="text-xs text-muted-text">{new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {/* Repo */}
      <Card>
        <CardContent className="pt-6">
          <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-japan-red hover:text-dark-red font-medium transition-colors">
            <ExternalLink className="h-4 w-4" />
            {submission.repoUrl.replace('https://github.com/', '')}
          </a>
        </CardContent>
      </Card>

      {/* Score Rubric Form */}
      {(submission.status === 'pending' || submission.status === 'in_review') && (
        <Card>
          <CardHeader><CardTitle>Score & Review</CardTitle></CardHeader>
          <CardContent>
            <ScoreRubricForm
              onSubmit={handleReviewSubmit}
              isPending={submitReview.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Existing review */}
      {submission.review && (
        <Card>
          <CardHeader><CardTitle>Review</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submission.review.scores.map((s) => (
                <div key={s.criterionId} className="flex justify-between">
                  <span className="text-sm text-secondary-text">{s.criterionName}</span>
                  <span className="text-sm font-medium">{s.score}/{s.maxScore}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-japan-red">{submission.review.totalScore}</span>
              </div>
              {submission.review.feedback && (
                <>
                  <Separator />
                  <p className="text-sm text-secondary-text whitespace-pre-wrap">{submission.review.feedback}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />
      <CommentThread submissionId={id} />
    </div>
  );
}
