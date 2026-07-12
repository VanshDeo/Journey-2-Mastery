'use client';

import { usePosts } from '@/hooks/queries/usePosts';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import PosterCard from '@/components/shared/PosterCard';
import { Newspaper } from 'lucide-react';

export default function PostsPage() {
  const { data: posts, isLoading, isError, error, refetch } = usePosts();

  if (isLoading) return <LoadingSkeleton variant="card-grid" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
          <Newspaper className="h-7 w-7 text-japan-red" />
          Community Posts
        </h1>
        <p className="text-secondary-text mt-1">Announcements and updates from the platform.</p>
      </div>

      {!posts || posts.length === 0 ? (
        <EmptyState icon="file" title="No posts yet" message="Check back later for community announcements." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade">
          {posts.map((post) => (
            <PosterCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
