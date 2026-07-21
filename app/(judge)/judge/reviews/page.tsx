'use client';

import { useJudgeReviews } from '@/hooks/queries/useJudgeQueue';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock } from 'lucide-react';
import Link from 'next/link';

export default function JudgeReviewsPage() {
  const { data: reviews, isLoading, isError, error, refetch } = useJudgeReviews();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text">My Reviews</h1>
        <p className="text-secondary-text mt-1">All reviews you&apos;ve submitted.</p>
      </div>

      {!reviews || reviews.length === 0 ? (
        <EmptyState icon="list" title="No reviews yet" message="Reviews will appear here once you've reviewed submissions." />
      ) : (
        <div className="space-y-3 stagger-fade">
          {reviews.map((review) => (
            <Link key={review.id} href={`/judge/reviews/${review.id}`} className="block">
              <Card className="hover:shadow-md hover:border-japan-red/20 transition-all cursor-pointer">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-text">Review #{review.id.slice(0, 8)}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-text">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.canEdit && <span className="text-amber-600">Editable</span>}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-japan-red">
                    <Star className="h-4 w-4" /> {review.totalScore}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
