'use client';

import { useState } from 'react';
import { useComments, useAddComment } from '@/hooks/queries/useComments';
import { useSession } from '@/hooks/useSession';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';
import type { Comment } from '@/types/api.types';

interface CommentThreadProps {
  submissionId: string;
}

export default function CommentThread({ submissionId }: CommentThreadProps) {
  const { data: comments, isLoading } = useComments(submissionId);
  const addComment = useAddComment();
  const { data: user } = useSession();
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addComment.mutate(
      { submissionId, content: content.trim() },
      { onSuccess: () => setContent('') }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-primary-text">Discussion</h3>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment: Comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                {comment.userAvatar && <AvatarImage src={comment.userAvatar} />}
                <AvatarFallback className="text-xs">
                  {comment.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-primary-text">{comment.userName}</span>
                  <span className="text-xs text-muted-text capitalize">{comment.userRole}</span>
                  <span className="text-xs text-muted-text">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-secondary-text">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-text py-4">No comments yet. Start the discussion.</p>
      )}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3 pt-2 border-t border-borders">
          <Avatar className="h-8 w-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
            <AvatarFallback className="text-xs">
              {(user.fullName || user.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[40px] h-10 resize-none"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!content.trim() || addComment.isPending}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
