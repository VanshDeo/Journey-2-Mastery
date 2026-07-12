'use client';

import { useState } from 'react';
import { useAdminPosts, useCreatePost, useDeletePost } from '@/hooks/queries/usePosts';
import PostEditor from '@/components/admin/PostEditor';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminPostsPage() {
  const { data: posts, isLoading, isError, error, refetch } = useAdminPosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-primary-text">Posts</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Post</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Post</DialogTitle></DialogHeader>
            <PostEditor
              onSubmit={(data) => createPost.mutate(data, { onSuccess: () => { toast.success('Post created'); setDialogOpen(false); } })}
              isPending={createPost.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!posts || posts.length === 0 ? (
        <EmptyState icon="file" title="No posts" message="Create your first community post." />
      ) : (
        <div className="border border-borders rounded-lg overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="secondary">Draft</Badge>}</TableCell>
                  <TableCell className="text-sm text-muted-text">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Link href={`/admin/posts/${p.id}/edit`}><Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                    <ConfirmDialog trigger={<Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>} title="Delete post?" description={`This will permanently delete "${p.title}".`} confirmLabel="Delete" variant="destructive" onConfirm={() => deletePost.mutate(p.id, { onSuccess: () => toast.success('Post deleted') })} />
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
