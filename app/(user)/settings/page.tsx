'use client';

import { useState } from 'react';
import { useSettings, useUpdateSettings, useDeleteAccount } from '@/hooks/queries/useSettings';
import { useSessions, useRevokeSession } from '@/hooks/queries/useSettings';
import { useLogout } from '@/hooks/useSession';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Monitor, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: settings, isLoading: settingsLoading, isError: settingsError, error: settingsErr, refetch: refetchSettings } = useSettings();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
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
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary-text flex items-center gap-3">
        <SettingsIcon className="h-7 w-7 text-japan-red" />
        Settings
      </h1>

      {/* Notifications */}
      {settings && (
        <Card>
          <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
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
          <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" />Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <LoadingSkeleton />
          ) : !sessions || sessions.length === 0 ? (
            <p className="text-sm text-muted-text">No active sessions.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-borders">
                  <div>
                    <p className="text-sm font-medium text-primary-text">
                      {session.userAgent?.substring(0, 50) || 'Unknown device'}
                      {session.isCurrent && <span className="text-xs text-emerald-600 ml-2">(Current)</span>}
                    </p>
                    <p className="text-xs text-muted-text">{session.ipAddress} · Last used {new Date(session.lastUsedAt).toLocaleDateString()}</p>
                  </div>
                  {!session.isCurrent && (
                    <Button variant="outline" size="sm" onClick={() => revokeSession.mutate(session.id)}>Revoke</Button>
                  )}
                </div>
              ))}
            </div>
          )}
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
          <p className="text-sm text-secondary-text">Once you delete your account, there is no going back. This action is permanent.</p>
          <div className="space-y-2">
            <Label>Type <strong>DELETE</strong> to confirm</Label>
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          </div>
          <Button variant="destructive" disabled={deleteConfirm !== 'DELETE' || deleteAccount.isPending} onClick={handleDeleteAccount}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
