'use client';

import { useParams, useRouter } from 'next/navigation';
import { useJudgeReview, useUpdateReview } from '@/hooks/queries/useJudgeQueue';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import ScoreRubricForm from '@/components/judge/ScoreRubricForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function JudgeReviewDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: review, isLoading, isError, error, refetch } = useJudgeReview(id);
  const updateReview = useUpdateReview();

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!review) return null;

  const handleUpdate = (scores: { criterionId: string; score: number }[], feedback: string) => {
    updateReview.mutate(
      { id, scores, feedback },
      {
        onSuccess: () => {
          toast.success('Review updated');
          refetch();
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/judge/reviews" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Reviews
      </Link>

      <h1 className="font-serif text-2xl font-bold text-primary-text flex items-center gap-2">
        <Star className="h-6 w-6 text-japan-red" />
        Review Detail
      </h1>

      {/* Current Scores */}
      <Card>
        <CardHeader><CardTitle>Score Breakdown — {review.totalScore} total</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {review.scores.map((s) => (
              <div key={s.criterionId} className="flex justify-between">
                <span className="text-sm text-secondary-text">{s.criterionName}</span>
                <span className="text-sm font-medium">{s.score}/{s.maxScore}</span>
              </div>
            ))}
          </div>
          {review.feedback && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-secondary-text whitespace-pre-wrap">{review.feedback}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      {review.canEdit && (
        <Card>
          <CardHeader><CardTitle>Edit Review</CardTitle></CardHeader>
          <CardContent>
            <ScoreRubricForm
              onSubmit={handleUpdate}
              isPending={updateReview.isPending}
              initialScores={review.scores.map((s) => ({ criterionId: s.criterionId, score: s.score }))}
              initialFeedback={review.feedback}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
