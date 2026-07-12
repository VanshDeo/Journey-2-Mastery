import { cn } from '@/lib/utils';
import type { Post } from '@/types/api.types';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

interface PosterCardProps {
  post: Post;
  className?: string;
}

export default function PosterCard({ post, className }: PosterCardProps) {
  return (
    <Link href={`/posts/${post.id}`}>
      <article
        className={cn(
          'group rounded-lg border border-borders bg-card-bg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-japan-red/20 hover:-translate-y-0.5',
          className
        )}
      >
        {post.posterImageUrl && (
          <div className="aspect-video overflow-hidden bg-secondary-bg">
            <img
              src={post.posterImageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5">
          <h3 className="font-serif text-lg font-semibold text-primary-text mb-2 line-clamp-2 group-hover:text-japan-red transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-secondary-text line-clamp-2 mb-3">
            {post.description}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-text">
            <Calendar className="h-3 w-3" />
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      </article>
    </Link>
  );
}
