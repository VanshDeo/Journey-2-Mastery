'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import {
  useTeamDetail,
  useCreateTeam,
  useJoinTeam,
  useUpdateTeamName,
  useRegenerateJoinCode,
  useDisbandTeam,
  useLeaveTeam,
  useKickMember,
  useTransferLeadership,
} from '@/hooks/queries/useTeam';
import { cn } from '@/lib/utils';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Users as TeamIcon,
  Plus,
  Key,
  Copy,
  RefreshCw,
  Edit2,
  Trash2,
  LogOut,
  UserMinus,
  Crown,
  Check,
  X,
  Award,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

export default function TeamPage() {
  const { data: currentUser } = useSession();
  const { data: team, isLoading, isError, error, refetch } = useTeamDetail();

  const createTeamMutation = useCreateTeam();
  const joinTeamMutation = useJoinTeam();
  const updateNameMutation = useUpdateTeamName();
  const regenerateCodeMutation = useRegenerateJoinCode();
  const disbandTeamMutation = useDisbandTeam();
  const leaveTeamMutation = useLeaveTeam();
  const kickMemberMutation = useKickMember();
  const transferLeadershipMutation = useTransferLeadership();

  // Onboarding local state
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // Dashboard local state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [disbandConfirm, setDisbandConfirm] = useState('');

  if (isLoading) return <LoadingSkeleton variant="form" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    createTeamMutation.mutate(
      { name: teamName.trim() },
      {
        onSuccess: () => {
          toast.success('Team created successfully!');
          setTeamName('');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to create team.');
        },
      }
    );
  };

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    joinTeamMutation.mutate(
      { code: joinCode.trim().toUpperCase() },
      {
        onSuccess: () => {
          toast.success('Joined team successfully!');
          setJoinCode('');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to join team.');
        },
      }
    );
  };

  const handleUpdateName = () => {
    if (!newName.trim() || !team) return;
    updateNameMutation.mutate(
      { teamId: team.id, name: newName.trim() },
      {
        onSuccess: () => {
          toast.success('Team name updated.');
          setEditingName(false);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to update team name.');
        },
      }
    );
  };

  const handleRegenerateCode = () => {
    if (!team) return;
    regenerateCodeMutation.mutate(team.id, {
      onSuccess: () => {
        toast.success('Join code regenerated successfully.');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to regenerate code.');
      },
    });
  };

  const handleDisbandTeam = () => {
    if (!team || disbandConfirm !== 'DISBAND') return;
    disbandTeamMutation.mutate(team.id, {
      onSuccess: () => {
        toast.success('Team disbanded.');
        setDisbandConfirm('');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to disband team.');
      },
    });
  };

  const handleLeaveTeam = () => {
    if (!team) return;
    leaveTeamMutation.mutate(team.id, {
      onSuccess: () => {
        toast.success('You have left the team.');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to leave team.');
      },
    });
  };

  const handleKickMember = (userId: string, username: string) => {
    if (!team) return;
    if (confirm(`Are you sure you want to remove ${username} from the team?`)) {
      kickMemberMutation.mutate(
        { teamId: team.id, userId },
        {
          onSuccess: () => {
            toast.success(`${username} removed from team.`);
          },
          onError: (err) => {
            toast.error(err.message || 'Failed to remove member.');
          },
        }
      );
    }
  };

  const handleTransferLeadership = (memberId: string, memberName: string) => {
    if (!team) return;
    if (confirm(`Transfer leadership to ${memberName}? You will become a regular member.`)) {
      transferLeadershipMutation.mutate(
        { teamId: team.id, newLeaderId: memberId },
        {
          onSuccess: () => {
            toast.success(`Leadership transferred to ${memberName}.`);
          },
          onError: (err) => {
            toast.error(err.message || 'Failed to transfer leadership.');
          },
        }
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Join code copied to clipboard!');
  };

  // ──────────────────────────────────────────────
  // Rendering Solo Onboarding View
  // ──────────────────────────────────────────────
  if (!team) {
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
                <TeamIcon className="h-10 w-10 text-japan-red" />
                Dojo of Teams
              </h1>
              <p className="text-secondary-text mt-4 font-medium text-lg max-w-2xl">
                Choose your path. Assemble a clan of 2 to 3 warriors to collaborate and face challenges together.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Create Team Card */}
          <Card className="hover:shadow-lg transition-all duration-300 border-borders/60 flex flex-col justify-between bg-white/80">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-2 border border-japan-red/20">
                <Plus className="h-6 w-6 text-japan-red" />
              </div>
              <CardTitle className="font-serif text-2xl">Found a Clan</CardTitle>
              <p className="text-sm text-muted-text">
                Start a new team as the leader. You will generate a join code to invite your fellow warriors.
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name" className="font-bold">Clan Name</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter clan name"
                    className="h-10"
                    maxLength={100}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-japan-red hover:bg-hover-red text-white h-10 cursor-pointer font-bold"
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? 'Forging...' : 'Found Clan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Team Card */}
          <Card className="hover:shadow-lg transition-all duration-300 border-borders/60 flex flex-col justify-between bg-white/80">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-2 border border-indigo-200">
                <Key className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="font-serif text-2xl">Join a Clan</CardTitle>
              <p className="text-sm text-muted-text">
                Enter a 6-character secret code shared by a clan leader to join their ranks.
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code" className="font-bold">Secret Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. AB12XY"
                    className="h-10 uppercase tracking-widest text-center font-bold text-lg"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 cursor-pointer font-bold"
                  disabled={joinTeamMutation.isPending}
                >
                  {joinTeamMutation.isPending ? 'Joining...' : 'Join Clan'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Rendering Active Team Dashboard
  // ──────────────────────────────────────────────
  const userRole = team.members.find((m) => m.userId === currentUser?.id)?.role;
  const isLeader = userRole === 'leader';
  const isActive = team.status === 'active';

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
              <TeamIcon className="h-10 w-10 text-japan-red" />
              Clan Command Center
            </h1>
            <p className="text-secondary-text mt-4 font-medium text-lg">Manage your team and track your shared glory.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-borders flex items-center gap-3">
             <NinjaStarIcon className="w-5 h-5 text-japan-red" />
             <span className="font-bold text-lg">{team.score} Honor Points</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Team Identity and Members) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Name Card */}
          <Card className="border-borders shadow-sm bg-white/80">
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New Team Name"
                        className="h-10 font-bold"
                      />
                      <Button size="icon" onClick={handleUpdateName} disabled={updateNameMutation.isPending} className="bg-japan-red hover:bg-hover-red text-white cursor-pointer h-10 w-10 shrink-0">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingName(false)} className="h-10 w-10 shrink-0 border border-borders">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-3xl font-bold text-primary-text">{team.name}</h2>
                      {isLeader && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setNewName(team.name);
                            setEditingName(true);
                          }}
                          className="h-8 w-8 text-muted-text hover:text-japan-red cursor-pointer border border-transparent hover:border-japan-red/20 hover:bg-red-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-text mt-2 font-mono">ID: {team.id}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize font-bold px-3 py-1 text-sm tracking-wider',
                    isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  )}
                >
                  {team.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Members Card */}
          <Card className="border-borders shadow-sm bg-white/80">
            <CardHeader className="border-b border-borders/50 bg-card-bg">
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-japan-red" />
                Clan Members ({team.members.length}/3)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {team.members.map((member) => (
                <div key={member.userId} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", member.userId === currentUser?.id ? 'border-japan-red/40 bg-red-50/50 shadow-sm' : 'border-borders bg-white')}>
                  <div className="flex items-center gap-4">
                    <Avatar className={cn("h-12 w-12 border-2", member.role === 'leader' ? 'border-[#D4AF37]' : 'border-borders')}>
                      {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
                      <AvatarFallback className="font-bold">{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-primary-text">{member.username}</span>
                        {member.userId === currentUser?.id && (
                          <span className="text-[10px] text-japan-red font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-japan-red/10">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-text mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-bold uppercase", member.role === 'leader' ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-borders text-secondary-text bg-secondary-bg')}>
                      {member.role === 'leader' ? <Crown className="h-3.5 w-3.5 mr-1" /> : null}
                      {member.role}
                    </Badge>

                    {/* Leader actions on other members */}
                    {isLeader && member.userId !== currentUser?.id && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Transfer Leadership"
                          onClick={() => handleTransferLeadership(member.userId, member.username)}
                          className="h-8 w-8 text-amber-600 hover:bg-amber-50 cursor-pointer border border-transparent hover:border-amber-200"
                        >
                          <Crown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Remove Member"
                          onClick={() => handleKickMember(member.userId, member.username)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 cursor-pointer border border-transparent hover:border-red-200"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Join Code & Actions) */}
        <div className="space-y-6">
          {/* Join Code Card (Leader Only) */}
          {isLeader && team.joinCode && (
            <Card className="border-borders shadow-sm bg-white/80">
              <CardHeader className="border-b border-borders/50 bg-card-bg">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  Invite Warriors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <p className="text-sm text-secondary-text">
                  Share this secret code with your allies. Up to 3 members can join.
                </p>
                <div className="flex items-center gap-2 bg-secondary-bg border border-borders p-4 rounded-xl justify-between shadow-inner">
                  <span className="font-mono text-2xl font-bold tracking-[0.2em] text-primary-text select-all">
                    {team.joinCode}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(team.joinCode!)}
                    className="h-10 w-10 cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Copy className="h-5 w-5 text-indigo-600" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm font-bold h-10 gap-2 cursor-pointer border-borders hover:bg-secondary-bg"
                  onClick={handleRegenerateCode}
                  disabled={regenerateCodeMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 text-muted-text" />
                  Regenerate Code
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Team Info / Stats Card */}
          <Card className="border-borders shadow-sm bg-white/80">
            <CardHeader className="border-b border-borders/50 bg-card-bg">
              <CardTitle className="text-base font-serif flex items-center gap-2">
                <Award className="w-5 h-5 text-japan-red" />
                Clan Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between py-3 border-b border-borders/50">
                <span className="text-secondary-text font-medium flex items-center gap-2"><NinjaStarIcon className="h-5 w-5 text-japan-red opacity-70" /> Honor Points</span>
                <span className="font-bold text-lg text-japan-red">{team.score} pts</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-secondary-text font-medium flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500 opacity-70" /> Size</span>
                <span className="font-bold text-lg text-primary-text">{team.members.length}/3 warriors</span>
              </div>

              {!isActive && (
                <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-xl text-amber-800 space-y-2">
                  <p className="font-bold flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Incomplete Clan
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">
                    You need at least 2 members before you can submit tasks. Share your secret code to invite allies.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaving / Disbanding Operations */}
          <Card className={cn('border-borders shadow-sm bg-white/80', isLeader && 'border-red-200 bg-red-50/30')}>
            <CardHeader className="border-b border-borders/50 bg-transparent">
              <CardTitle className="text-base text-red-600 flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
                {isLeader ? 'Disband Clan' : 'Leave Clan'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {isLeader ? (
                <>
                  <p className="text-sm text-secondary-text">
                    Disbanding will immediately kick all members and permanently delete the clan.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Type <strong className="text-red-600">DISBAND</strong> to confirm</Label>
                    <Input
                      value={disbandConfirm}
                      onChange={(e) => setDisbandConfirm(e.target.value)}
                      placeholder="DISBAND"
                      className="h-10 text-base border-red-200 focus-visible:ring-red-500"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full h-10 cursor-pointer font-bold bg-red-600 hover:bg-red-700 text-white"
                    disabled={disbandConfirm !== 'DISBAND' || disbandTeamMutation.isPending}
                    onClick={handleDisbandTeam}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {disbandTeamMutation.isPending ? 'Disbanding...' : 'Disband Clan'}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-secondary-text">
                    You will immediately return to solo play. Your previous solo submissions remain yours.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full h-10 cursor-pointer font-bold bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleLeaveTeam}
                    disabled={leaveTeamMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {leaveTeamMutation.isPending ? 'Leaving...' : 'Leave Clan'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
