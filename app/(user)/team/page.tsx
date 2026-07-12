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
import { Separator } from '@/components/ui/separator';
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
  const [transferringMemberId, setTransferringMemberId] = useState<string | null>(null);

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
            setTransferringMemberId(null);
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
      <div className="space-y-8 max-w-4xl mx-auto py-4">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-4xl font-bold text-primary-text flex items-center justify-center gap-3">
            <TeamIcon className="h-9 w-9 text-japan-red" />
            Team Mode
          </h1>
          <p className="text-secondary-text max-w-xl mx-auto">
            Choose your path. Assemble a team of 2 to 3 players to collaborate and submit tasks together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Create Team Card */}
          <Card className="hover:shadow-lg transition-all duration-300 border-borders/60 flex flex-col justify-between">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-lg bg-japan-red/10 flex items-center justify-center mb-2">
                <Plus className="h-6 w-6 text-japan-red" />
              </div>
              <CardTitle className="font-serif text-2xl">Create a Team</CardTitle>
              <p className="text-sm text-muted-text">
                Start a new team as the leader. You will generate a join code to invite teammates.
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="h-10"
                    maxLength={100}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-japan-red hover:bg-hover-red text-white h-10 cursor-pointer"
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Team Card */}
          <Card className="hover:shadow-lg transition-all duration-300 border-borders/60 flex flex-col justify-between">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-2">
                <Key className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="font-serif text-2xl">Join a Team</CardTitle>
              <p className="text-sm text-muted-text">
                Enter a 6-character join code shared by a team leader to play as a team member.
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code">Join Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. AB12XY"
                    className="h-10 uppercase tracking-widest text-center font-bold"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 cursor-pointer"
                  disabled={joinTeamMutation.isPending}
                >
                  {joinTeamMutation.isPending ? 'Joining...' : 'Join Team'}
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TeamIcon className="h-7 w-7 text-japan-red" />
        <h1 className="font-serif text-3xl font-bold text-primary-text">
          Team Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Team Identity and Members) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Name Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New Team Name"
                        className="h-9"
                      />
                      <Button size="sm" onClick={handleUpdateName} disabled={updateNameMutation.isPending}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-2xl font-bold text-primary-text">{team.name}</h2>
                      {isLeader && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setNewName(team.name);
                            setEditingName(true);
                          }}
                          className="h-8 w-8 text-muted-text hover:text-primary-text cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-text mt-1">ID: {team.id}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'capitalize font-medium px-2.5 py-0.5',
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members ({team.members.length}/3)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg border border-borders bg-card-bg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
                      <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-primary-text">{member.username}</span>
                        {member.userId === currentUser?.id && (
                          <span className="text-[10px] text-muted-text font-semibold px-1.5 py-0.5 rounded bg-secondary-bg border border-borders">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-text mt-0.5">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={member.role === 'leader' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-borders text-secondary-text'}>
                      {member.role === 'leader' ? <Crown className="h-3 w-3 mr-1" /> : null}
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
                          className="h-8 w-8 text-amber-600 hover:bg-amber-50 cursor-pointer"
                        >
                          <Crown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Remove Member"
                          onClick={() => handleKickMember(member.userId, member.username)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 cursor-pointer"
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invite Teammates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-text">
                  Share this join code with your teammate. Up to 3 members can join.
                </p>
                <div className="flex items-center gap-2 bg-secondary-bg border border-borders p-3 rounded-lg justify-between">
                  <span className="font-mono text-xl font-bold tracking-widest text-primary-text select-all">
                    {team.joinCode}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(team.joinCode!)}
                    className="h-8 w-8 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-9 gap-1.5 cursor-pointer"
                  onClick={handleRegenerateCode}
                  disabled={regenerateCodeMutation.isPending}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate Code
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Team Info / Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-borders/50">
                <span className="text-muted-text flex items-center gap-1.5"><Award className="h-4 w-4 text-japan-red" /> Team Score</span>
                <span className="font-bold text-sm text-japan-red">{team.score} pts</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-text flex items-center gap-1.5"><Users className="h-4 w-4 text-indigo-500" /> Size</span>
                <span className="font-medium text-secondary-text">{team.members.length}/3 members</span>
              </div>

              {!isActive && (
                <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-lg text-amber-800 space-y-1.5">
                  <p className="font-medium">Incomplete Team</p>
                  <p className="text-[10px] leading-relaxed">
                    You need at least 2 members before you can submit tasks. Share your join code to invite teammates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaving / Disbanding Operations */}
          <Card className={cn('border-red-200', !isLeader && 'border-borders/60')}>
            <CardHeader>
              <CardTitle className="text-base text-red-600 flex items-center gap-2">
                {isLeader ? 'Disband Team' : 'Leave Team'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLeader ? (
                <>
                  <p className="text-xs text-secondary-text">
                    Disbanding will immediately kick all members and permanently delete the team.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs">Type <strong>DISBAND</strong> to confirm</Label>
                    <Input
                      value={disbandConfirm}
                      onChange={(e) => setDisbandConfirm(e.target.value)}
                      placeholder="DISBAND"
                      className="h-9 text-sm"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full h-9 cursor-pointer"
                    disabled={disbandConfirm !== 'DISBAND' || disbandTeamMutation.isPending}
                    onClick={handleDisbandTeam}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {disbandTeamMutation.isPending ? 'Disbanding...' : 'Disband Team'}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-secondary-text">
                    You will immediately return to solo play. Your previous solo submissions remain yours.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full h-9 cursor-pointer"
                    onClick={handleLeaveTeam}
                    disabled={leaveTeamMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {leaveTeamMutation.isPending ? 'Leaving...' : 'Leave Team'}
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
