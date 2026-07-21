'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/queries/usePosts';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import PosterCard from '@/components/shared/PosterCard';
import { Newspaper, Search, ChevronDown, Calendar, ChevronRight, Swords, Scroll, Landmark, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Post } from '@/types/api.types';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

const TABS = ['All Posts', 'Announcements', 'Updates', 'Events', 'Resources'];

export default function PostsPage() {
  const { data: posts, isLoading, isError, error, refetch } = usePosts();
  const [activeTab, setActiveTab] = useState('All Posts');
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) return <LoadingSkeleton variant="card-grid" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const featuredPost = filteredPosts[0];
  const latestUpdates = filteredPosts.slice(1, 4);
  const gridPosts = filteredPosts.slice(4);

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
        <>
          {/* Top Section: Featured + Latest Updates */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Featured Post */}
            {featuredPost && (
              <div className="lg:w-2/3 flex flex-col">
                <Link href={`/posts/${featuredPost.id}`} className="group flex-1 flex flex-col md:flex-row rounded-2xl border border-borders bg-[#F5F2EB] overflow-hidden relative transition-all duration-300 hover:shadow-md">
                  <div className="md:w-1/2 relative min-h-[300px]">
                    {featuredPost.posterImageUrl ? (
                      <img src={featuredPost.posterImageUrl} alt="Featured" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-japan-red/10 to-transparent flex items-center justify-center">
                        <Star className="h-24 w-24 text-japan-red/20" />
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center bg-[url('/images/paper-texture.png')] bg-cover relative">
                    <div className="text-japan-red font-bold text-xs tracking-widest uppercase mb-4">Featured</div>
                    <h2 className="font-serif text-3xl font-bold text-primary-text mb-6 group-hover:text-japan-red transition-colors line-clamp-2">
                      {featuredPost.title}
                    </h2>
                    <div className="flex justify-center mb-6">
                      <NinjaStarIcon className="h-6 w-6 text-primary-text" />
                    </div>
                    <p className="text-secondary-text mb-8 line-clamp-3 leading-relaxed">
                      {featuredPost.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-secondary-text mt-auto">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredPost.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
                {/* Pagination Dots (UI Only) */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 rounded-full bg-japan-red"></div>
                  <div className="w-2 h-2 rounded-full bg-borders"></div>
                  <div className="w-2 h-2 rounded-full bg-borders"></div>
                </div>
              </div>
            )}

            {/* Latest Updates */}
            {latestUpdates.length > 0 && (
              <div className="lg:w-1/3 rounded-2xl border border-borders bg-off-white p-6 flex flex-col">
                <h3 className="font-serif text-xl font-bold text-primary-text mb-6 pb-2 border-b-2 border-japan-red inline-block">
                  Latest Updates
                </h3>
                <div className="flex flex-col gap-6 flex-1">
                  {latestUpdates.map((update, i) => {
                    const icons = [<Star key={0} />, <Swords key={1} />, <Scroll key={2} />, <Landmark key={3} />];
                    const icon = icons[i % icons.length];
                    return (
                      <Link key={update.id} href={`/posts/${update.id}`} className="group flex gap-4 items-start">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-borders flex items-center justify-center text-secondary-text group-hover:bg-japan-red group-hover:text-white transition-colors">
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-primary-text truncate group-hover:text-japan-red transition-colors">
                              {update.title}
                            </h4>
                            <span className="text-xs text-muted-text whitespace-nowrap pt-1">
                              {/* Fake relative time since we don't have a date-fns library handy, fallback to date */}
                              {new Date(update.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-secondary-text line-clamp-2 mt-1">
                            {update.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-borders group-hover:text-japan-red transition-colors mt-1" />
                      </Link>
                    );
                  })}
                </div>
                <Link href="#all-posts" className="text-japan-red font-medium text-sm flex items-center gap-1 mt-6 hover:underline">
                  View All Posts <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Filter and Search Bar */}
          <div id="all-posts" className="bg-white rounded-full border border-borders p-2 flex flex-col md:flex-row items-center justify-between gap-4 mt-4 shadow-sm">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto px-2 pb-2 md:pb-0 hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                    activeTab === tab 
                      ? "bg-japan-red text-white shadow-md"
                      : "text-secondary-text hover:bg-off-white hover:text-primary-text"
                  )}
                  style={activeTab === tab ? {
                    // Slight rough brush stroke effect for active tab
                    borderRadius: '20px 8px 20px 8px',
                  } : {}}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search and Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto pr-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-off-white border border-borders rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red transition-colors"
                />
              </div>
              <div className="relative">
                <select className="appearance-none bg-off-white border border-borders rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-japan-red/20 focus:border-japan-red text-primary-text font-medium cursor-pointer">
                  <option>All Categories</option>
                  <option>Announcements</option>
                  <option>Updates</option>
                  <option>Events</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid Posts */}
          {gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade max-w-7xl mx-auto pt-4">
              {gridPosts.map((post) => (
                <div key={post.id} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-japan-red to-[#D4AF37] rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                  <PosterCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-secondary-text bg-card-bg border border-borders rounded-xl mt-4">
              No posts match your filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}
