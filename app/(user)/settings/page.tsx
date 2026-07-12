'use client';

import { useState } from 'react';
import { useSettings, useUpdateSettings, useDeleteAccount } from '@/hooks/queries/useSettings';
import { useSessions, useRevokeSession } from '@/hooks/queries/useSettings';
import { useLogout, useSession } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RankBadge from '@/components/shared/RankBadge';
import { Settings as SettingsIcon, Monitor, Trash2, AlertTriangle, Award, School } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: settings, isLoading: settingsLoading, isError: settingsError, error: settingsErr, refetch: refetchSettings } = useSettings();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: user } = useSession();
  const updateSettings = useUpdateSettings();
  const revokeSession = useRevokeSession();
  const deleteAccount = useDeleteAccount();
  const logout = useLogout();

  const [deleteConfirm, setDeleteConfirm] = useState('');

  if (settingsLoading) return <LoadingSkeleton variant="form" />;
  if (settingsError) return <ErrorState error={settingsErr} onRetry={refetchSettings} />;

  const handleToggle = (key: keyof NonNullable<typeof settings>, value: boolean) => {
    if (!settings) return;
    updateSettings.mutate({ [key]: value });
  };

  const handleDeleteAccount = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        toast.success('Account deleted');
        logout.mutate();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-7 w-7 text-japan-red" />
        <h1 className="font-serif text-3xl font-bold text-primary-text">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Settings Main) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {([
                  { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive email updates' },
                  { key: 'submissionUpdates' as const, label: 'Submission Updates', desc: 'Get notified when your submissions are reviewed' },
                  { key: 'reviewNotifications' as const, label: 'Review Notifications', desc: 'Notifications about review activity' },
                  { key: 'leaderboardUpdates' as const, label: 'Leaderboard Updates', desc: 'Updates when rankings change' },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label>{label}</Label>
                      <p className="text-xs text-muted-text">{desc}</p>
                    </div>
                    <Switch checked={settings[key]} onCheckedChange={(v) => handleToggle(key, v)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <LoadingSkeleton />
              ) : !sessions || sessions.length === 0 ? (
                <p className="text-sm text-muted-text">No active sessions.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-borders bg-card-bg">
                      <div>
                        <p className="text-sm font-medium text-primary-text">
                          {session.userAgent?.substring(0, 50) || 'Unknown device'}
                          {session.isCurrent && <span className="text-xs text-emerald-600 ml-2">(Current)</span>}
                        </p>
                        <p className="text-xs text-muted-text">
                          {session.ipAddress} · Last used {new Date(session.lastUsedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <Button variant="outline" size="sm" onClick={() => revokeSession.mutate(session.id)}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (User Profile & Danger Zone) */}
        <div className="space-y-6">
          {/* Account Profile Card */}
          <Card className="overflow-hidden">
            <div className="h-16 bg-japan-red/5 border-b border-borders" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col items-center -mt-8">
                <Avatar className="h-16 w-16 border-4 border-off-white shadow-sm">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                  <AvatarFallback className="text-lg bg-secondary-bg text-primary-text font-serif">
                    {(user?.fullName || user?.username)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-serif text-lg font-bold text-primary-text mt-3">
                  {user?.fullName || user?.username}
                </h2>
                <p className="text-xs text-muted-text">@{user?.username}</p>
                {user?.rank && (
                  <div className="mt-2">
                    <RankBadge rank={user.rank} size="sm" />
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-text flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-japan-red" />
                    Score
                  </span>
                  <span className="font-semibold text-japan-red">{user?.score || 0} pts</span>
                </div>
                {user?.collegeName && (
                  <div className="flex items-start justify-between text-xs gap-4">
                    <span className="text-muted-text flex items-center gap-1.5 shrink-0">
                      <School className="h-3.5 w-3.5" />
                      Institution
                    </span>
                    <span className="font-medium text-right text-secondary-text truncate max-w-[150px]">
                      {user.collegeName}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <Link href="/profile">View Full Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-secondary-text">
                Once you delete your account, there is no going back. This action is permanent.
              </p>
              <div className="space-y-2">
                <Label className="text-xs">Type <strong>DELETE</strong> to confirm</Label>
                <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="h-9 text-sm" />
              </div>
              <Button variant="destructive" size="sm" className="w-full" disabled={deleteConfirm !== 'DELETE' || deleteAccount.isPending} onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
