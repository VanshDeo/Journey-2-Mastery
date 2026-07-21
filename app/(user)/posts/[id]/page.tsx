'use client';

import { useParams } from 'next/navigation';
import { usePost } from '@/hooks/queries/usePosts';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import MarkdownPreview from '@/components/shared/MarkdownPreview';

export default function PostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: post, isLoading, isError, error, refetch } = usePost(id);

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!post) return null;

  return (
    <article className="max-w-3xl space-y-6">
      <Link href="/posts" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Posts
      </Link>

      {post.posterImageUrl && (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-secondary-bg">
          <img src={post.posterImageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text mb-3">{post.title}</h1>
        <div className="flex items-center gap-1.5 text-sm text-muted-text">
          <Calendar className="h-4 w-4" />
          {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <MarkdownPreview content={post.description} />
    </article>
  );
}
