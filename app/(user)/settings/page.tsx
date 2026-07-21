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
import Image from 'next/image';
import { cn } from '@/lib/utils';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

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
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-card-bg border border-borders px-8 py-10 md:py-16 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}>
          <Image src="/images/dashboard-header.png" alt="Landscape" fill className="object-cover mix-blend-multiply scale-105 grayscale contrast-125 brightness-110" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-text drop-shadow-sm flex items-center gap-3">
              <SettingsIcon className="h-10 w-10 text-japan-red" />
              Dojo Settings
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Configure your training environment and preferences.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Settings Main) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          {settings && (
            <Card className="border-borders shadow-sm bg-white/80">
              <CardHeader className="border-b border-borders/50 bg-card-bg">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {([
                  { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive email updates' },
                  { key: 'submissionUpdates' as const, label: 'Submission Updates', desc: 'Get notified when your submissions are reviewed' },
                  { key: 'reviewNotifications' as const, label: 'Review Notifications', desc: 'Notifications about review activity' },
                  { key: 'leaderboardUpdates' as const, label: 'Leaderboard Updates', desc: 'Updates when rankings change' },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="font-bold text-primary-text">{label}</Label>
                      <p className="text-sm text-secondary-text mt-1">{desc}</p>
                    </div>
                    <Switch checked={settings[key]} onCheckedChange={(v) => handleToggle(key, v)} className="data-[state=checked]:bg-japan-red" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Active Sessions */}
          <Card className="border-borders shadow-sm bg-white/80">
            <CardHeader className="border-b border-borders/50 bg-card-bg">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-indigo-500" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {sessionsLoading ? (
                <LoadingSkeleton />
              ) : !sessions || sessions.length === 0 ? (
                <p className="text-sm text-muted-text">No active sessions.</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-borders bg-white shadow-sm gap-4">
                      <div>
                        <p className="text-sm font-bold text-primary-text">
                          {session.userAgent?.substring(0, 50) || 'Unknown device'}
                          {session.isCurrent && <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-3">Current</span>}
                        </p>
                        <p className="text-xs text-secondary-text mt-1 font-mono">
                          {session.ipAddress} <span className="text-borders mx-2">|</span> Last used {new Date(session.lastUsedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <Button variant="outline" size="sm" onClick={() => revokeSession.mutate(session.id)} className="shrink-0 border-borders hover:bg-secondary-bg hover:text-japan-red transition-colors cursor-pointer">
                          Revoke Access
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
          <Card className="overflow-hidden border-borders shadow-sm bg-white/80">
            <div className="h-24 bg-card-bg border-b border-borders relative">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '12px 12px', color: 'black' }} />
            </div>
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col items-center -mt-12">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                  <AvatarFallback className="text-2xl bg-secondary-bg text-primary-text font-serif font-bold">
                    {(user?.fullName || user?.username)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-serif text-2xl font-bold text-primary-text mt-4">
                  {user?.fullName || user?.username}
                </h2>
                <p className="text-sm text-secondary-text mt-1 font-medium">@{user?.username}</p>
                {user?.rank && (
                  <div className="mt-3">
                    <RankBadge rank={user.rank} size="sm" />
                  </div>
                )}
              </div>

              <Separator className="my-6 border-borders/50" />

              <div className="space-y-4 px-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-text font-medium flex items-center gap-2">
                    <NinjaStarIcon className="h-4 w-4 text-japan-red opacity-70" />
                    Honor Points
                  </span>
                  <span className="font-bold text-japan-red text-base">{user?.score || 0} pts</span>
                </div>
                {user?.collegeName && (
                  <div className="flex items-start justify-between text-sm gap-4">
                    <span className="text-secondary-text font-medium flex items-center gap-2 shrink-0">
                      <School className="h-4 w-4 text-indigo-500 opacity-70" />
                      Institution
                    </span>
                    <span className="font-bold text-right text-primary-text truncate max-w-[150px]">
                      {user.collegeName}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-6 border-borders/50" />

              <Button variant="outline" className="w-full font-bold border-borders hover:bg-secondary-bg cursor-pointer" asChild>
                <Link href="/profile">View Full Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50/30 shadow-sm">
            <CardHeader className="border-b border-borders/50 bg-transparent">
              <CardTitle className="text-red-600 flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <p className="text-sm text-secondary-text leading-relaxed">
                Once you delete your account, there is no going back. This action is <strong className="text-red-600 font-bold">permanent</strong> and will destroy your legacy.
              </p>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Type <strong className="text-red-600">DELETE</strong> to confirm</Label>
                <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="h-10 text-base border-red-200 focus-visible:ring-red-500" />
              </div>
              <Button variant="destructive" className="w-full h-10 font-bold cursor-pointer bg-red-600 hover:bg-red-700 text-white" disabled={deleteConfirm !== 'DELETE' || deleteAccount.isPending} onClick={handleDeleteAccount}>
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
