'use client';

import { useNotifications, useMarkNotificationRead, useMarkAllRead, useDeleteNotification } from '@/hooks/queries/useNotifications';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
            <Bell className="h-7 w-7 text-japan-red" />
            Notifications
          </h1>
          <p className="text-secondary-text mt-1">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <EmptyState icon="inbox" title="All caught up!" message="No notifications at the moment." />
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-text uppercase tracking-wider">Unread</h2>
              {unread.map((n) => (
                <Card key={n.id} className="border-l-2 border-l-japan-red">
                  <CardContent className="pt-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markRead.mutate(n.id)}>
                      <p className="text-sm font-medium text-primary-text">{n.title}</p>
                      <p className="text-sm text-secondary-text mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-text mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => deleteNotification.mutate(n.id)}>
                      <Trash2 className="h-4 w-4 text-muted-text" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {read.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-text uppercase tracking-wider">Read</h2>
              {read.map((n) => (
                <Card key={n.id} className="opacity-70">
                  <CardContent className="pt-4 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-text">{n.title}</p>
                      <p className="text-sm text-secondary-text mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-text mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => deleteNotification.mutate(n.id)}>
                      <Trash2 className="h-4 w-4 text-muted-text" />
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
