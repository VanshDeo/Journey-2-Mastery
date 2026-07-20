'use client';

import { usePosts } from '@/hooks/queries/usePosts';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import PosterCard from '@/components/shared/PosterCard';
import { Newspaper } from 'lucide-react';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function PostsPage() {
  const { data: posts, isLoading, isError, error, refetch } = usePosts();

  if (isLoading) return <LoadingSkeleton variant="card-grid" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-12 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <NinjaStarIcon className="h-10 w-10 text-japan-red" />
              Community Noticeboard
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Hear the latest proclamations and updates from the masters.</p>
          </div>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <EmptyState icon="file" title="No announcements yet" message="The village is quiet. Check back later for news." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade max-w-7xl mx-auto">
          {posts.map((post) => (
            <div key={post.id} className="group relative">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-japan-red to-[#D4AF37] rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
               <PosterCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
