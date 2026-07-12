'use client';

import { useState } from 'react';
import { useProfile, useUpdateProfile, useUserBadges } from '@/hooks/queries/useUser';
import { useSession } from '@/hooks/useSession';
import { useRouter } from 'next/navigation';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: user } = useSession();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const { data: badges } = useUserBadges();
  const updateProfile = useUpdateProfile();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const displayUser = profile || user;
  if (!displayUser) return null;

  const startEdit = () => {
    setBio(displayUser.bio || '');
    setEditing(true);
  };

  const saveEdit = () => {
    updateProfile.mutate({ bio }, {
      onSuccess: () => {
        setEditing(false);
        toast.success('Profile updated');
        router.push('/dashboard');
      },
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary-text">Profile</h1>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              {displayUser.avatarUrl && <AvatarImage src={displayUser.avatarUrl} />}
              <AvatarFallback className="text-2xl">{(displayUser.fullName || displayUser.username)?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-serif text-2xl font-bold text-primary-text">{displayUser.fullName || displayUser.username}</h2>
                {displayUser.rank && <RankBadge rank={displayUser.rank} />}
              </div>
              <p className="text-sm text-muted-text mb-3">@{displayUser.username}</p>

              {editing ? (
                <div className="space-y-3">
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="min-h-[80px]" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} disabled={updateProfile.isPending}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="text-sm text-secondary-text flex-1">{displayUser.bio || 'No bio yet.'}</p>
                  <Button size="icon" variant="ghost" onClick={startEdit} className="shrink-0">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-xs text-muted-text mb-1">Role</p><p className="text-sm font-medium capitalize">{displayUser.role}</p></div>
            <div><p className="text-xs text-muted-text mb-1">Score</p><p className="text-sm font-semibold text-japan-red">{displayUser.score} pts</p></div>
            {displayUser.collegeName && <div><p className="text-xs text-muted-text mb-1">College</p><p className="text-sm">{displayUser.collegeName}</p></div>}
            {displayUser.branch && <div><p className="text-xs text-muted-text mb-1">Branch / Year</p><p className="text-sm">{displayUser.branch}{displayUser.year ? ` (${displayUser.year})` : ''}</p></div>}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-japan-red" />Badges</CardTitle>
        </CardHeader>
        <CardContent>
          {!badges || badges.length === 0 ? (
            <p className="text-sm text-muted-text">No badges earned yet. Complete tasks to earn badges!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg border border-borders bg-white">
                  {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={badge.name} className="w-10 h-10 rounded" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-secondary-bg flex items-center justify-center"><Award className="h-5 w-5 text-muted-text" /></div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-text">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
