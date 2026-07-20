'use client';

import { useNotifications, useMarkNotificationRead, useMarkAllRead, useDeleteNotification } from '@/hooks/queries/useNotifications';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function NotificationsPage() {
  const { data: notifications, isLoading, isError, error, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();
  const deleteNotification = useDeleteNotification();

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const unread = notifications?.filter((n) => !n.isRead) || [];
  const read = notifications?.filter((n) => n.isRead) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-10 md:py-12 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <Bell className="h-8 w-8 text-japan-red" />
              Whispers of the Wind
            </h1>
            <p className="text-secondary-text mt-2 font-medium">
              You have <strong className="text-japan-red">{unread.length}</strong> unread messages.
            </p>
          </div>
          {unread.length > 0 && (
            <Button className="bg-white/80 backdrop-blur text-primary-text border border-borders hover:bg-japan-red hover:text-white hover:border-japan-red transition-all cursor-pointer" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <EmptyState icon="inbox" title="The wind is silent" message="No new whispers at the moment." />
      ) : (
        <div className="space-y-8">
          {unread.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                <h2 className="text-lg font-serif font-bold text-primary-text tracking-wide">Unread Messages</h2>
              </div>
              {unread.map((n) => (
                <Card key={n.id} className="border-l-4 border-l-japan-red hover:shadow-md transition-shadow bg-white/80 group">
                  <CardContent className="p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markRead.mutate(n.id)}>
                      <p className="text-base font-bold text-primary-text group-hover:text-japan-red transition-colors">{n.title}</p>
                      <p className="text-sm text-secondary-text mt-1">{n.message}</p>
                      <p className="text-xs font-bold text-muted-text mt-2 uppercase tracking-wider">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-text hover:text-japan-red hover:bg-red-50 cursor-pointer" onClick={() => deleteNotification.mutate(n.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {read.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-muted-text" />
                <h2 className="text-lg font-serif font-bold text-muted-text tracking-wide">Archived Whispers</h2>
              </div>
              {read.map((n) => (
                <Card key={n.id} className="opacity-70 bg-card-bg border-borders">
                  <CardContent className="p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-text">{n.title}</p>
                      <p className="text-sm text-secondary-text mt-1">{n.message}</p>
                      <p className="text-xs font-bold text-muted-text mt-2 uppercase tracking-wider">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-text hover:text-japan-red hover:bg-red-50 cursor-pointer" onClick={() => deleteNotification.mutate(n.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
