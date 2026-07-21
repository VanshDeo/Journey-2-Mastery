'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAdminPost, useUpdatePost } from '@/hooks/queries/usePosts';
import PostEditor from '@/components/admin/PostEditor';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminPostEditPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: post, isLoading, isError, error, refetch } = useAdminPost(id);
  const updatePost = useUpdatePost();

  if (isLoading) return <LoadingSkeleton variant="form" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!post) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/posts" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Posts
      </Link>
      <h1 className="font-serif text-2xl font-bold text-primary-text">Edit Post</h1>
      <PostEditor
        initialData={{ title: post.title, description: post.description, posterImageUrl: post.posterImageUrl, isPublished: post.isPublished }}
        onSubmit={(data) => updatePost.mutate({ id, ...data }, { onSuccess: () => { toast.success('Post updated'); router.push('/admin/posts'); } })}
        isPending={updatePost.isPending}
        submitLabel="Update Post"
      />
    </div>
  );
}
