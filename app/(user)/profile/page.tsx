'use client';

import { useState } from 'react';
import { useProfile, useUpdateProfile, useUserBadges } from '@/hooks/queries/useUser';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, Check, Award, Shield, Star, Calendar, Activity, 
  Mail, Phone, Users, User, Settings, Send, 
  MessageSquare, Trophy, Clock, FileText, Globe, BookOpen, Building
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: user } = useSession();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const { data: badges } = useUserBadges();
  const { data: submissions } = useSubmissions();
  const updateProfile = useUpdateProfile();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  
  const displayUser = profile || user;
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    collegeName: '',
    branch: '',
    year: '',
    bio: ''
  });

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!displayUser) return null;

  const startEdit = () => {
    setFormData({
      fullName: displayUser.fullName || '',
      phone: displayUser.phone || '',
      collegeName: displayUser.collegeName || '',
      branch: displayUser.branch || '',
      year: displayUser.year || '',
      bio: displayUser.bio || ''
    });
    setEditing(true);
  };

  const saveEdit = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => {
        setEditing(false);
        toast.success('Profile updated successfully');
      },
      onError: (err) => {
         toast.error(err.message || 'Failed to update profile');
      }
    });
  };

  return (
    <div className="max-w-6xl space-y-6 animate-in pb-20">
      {/* Header */}
      <div className="mb-6 relative">
        <h1 className="font-serif text-4xl font-bold text-primary-text flex items-center gap-3">
          Profile 
          <NinjaStarIcon className="w-7 h-7 text-primary-text opacity-90 drop-shadow-sm" />
        </h1>
        <p className="text-sm text-secondary-text mt-1">Manage your profile information and preferences</p>
      </div>

      {/* Top Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Main Info (col-span-2) */}
        <Card className="lg:col-span-2 bg-[#FAF7F2] border-borders">
          <CardContent className="p-6 sm:p-8 h-full flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              <div className="relative shrink-0">
                <Avatar className="h-28 w-28 border-[4px] border-japan-red/20 ring-4 ring-white shadow-lg bg-white">
                  {displayUser.avatarUrl && <AvatarImage src={displayUser.avatarUrl} />}
                  <AvatarFallback className="text-4xl font-serif font-bold text-primary-text bg-secondary-bg">
                    {(displayUser.fullName || displayUser.username)?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={startEdit}
                  className="absolute bottom-0 right-0 p-2 bg-white border border-borders rounded-full shadow hover:bg-secondary-bg transition-colors"
                >
                  <Pencil className="h-4 w-4 text-primary-text" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-4 mb-1">
                  <h2 className="font-serif text-3xl font-bold text-primary-text truncate">
                    {displayUser.fullName || displayUser.username}
                  </h2>
                  <RankBadge rank={displayUser.rank || 'Ronin'} />
                </div>
                <p className="text-sm text-muted-text font-medium mb-4">@{displayUser.username}</p>
                
                <p className="text-sm text-secondary-text max-w-lg mb-6 leading-relaxed">
                  {displayUser.bio || 'No bio yet. Update your profile to tell us about yourself.'}
                </p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-primary-text font-medium">
                  {displayUser.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-text" />
                      {displayUser.email}
                    </div>
                  )}
                  {displayUser.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-text" />
                      {displayUser.phone}
                    </div>
                  )}
                  {displayUser.githubId && (
                    <a href={`https://github.com/${displayUser.username}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-japan-red transition-colors">
                      <GithubIcon className="h-4 w-4 text-muted-text" />
                      {displayUser.username}
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Score Widget */}
        <Card className="relative overflow-hidden border-borders">
          <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30">
            <Image src="/images/task_banner.png" alt="Background" fill className="object-cover object-right" />
          </div>
          <CardContent className="relative z-10 p-8 flex flex-col justify-center h-full">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-text mb-2">Total Score</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-serif text-5xl font-bold text-japan-red">{displayUser.score || 0}</span>
              <span className="text-lg font-bold text-japan-red">pts</span>
            </div>
            <p className="text-sm font-semibold text-primary-text mb-4 flex items-center gap-2">
              Keep building, warrior! <NinjaStarIcon className="w-3.5 h-3.5 text-primary-text opacity-80" />
            </p>
            <Button variant="outline" className="w-full bg-white/60 backdrop-blur-sm border-borders hover:bg-white text-primary-text font-bold" onClick={() => router.push('/leaderboard')}>
              <Trophy className="h-4 w-4 mr-2" /> View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Strip */}
      <Card className="bg-[#FAF7F2] border-borders">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-borders">
            
            <div className="flex-1 p-5 lg:p-6 flex items-center gap-4 hover:bg-white/50 transition-colors">
              <div className="p-3 bg-white border border-borders rounded-full shadow-sm"><Shield className="h-5 w-5 lg:h-6 lg:w-6 text-primary-text" /></div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-text mb-1">Role</p>
                <p className="font-bold capitalize text-primary-text">{displayUser.role || 'User'}</p>
              </div>
            </div>

            <div className="flex-1 p-5 lg:p-6 flex items-center gap-4 hover:bg-white/50 transition-colors">
              <div className="p-3 bg-white border border-borders rounded-full shadow-sm"><User className="h-5 w-5 lg:h-6 lg:w-6 text-japan-red" /></div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-text mb-1">Rank</p>
                <p className="font-bold text-primary-text">{displayUser.rank || 'Ronin'}</p>
              </div>
            </div>

            <div className="flex-1 p-5 lg:p-6 flex items-center gap-4 hover:bg-white/50 transition-colors">
              <div className="p-3 bg-white border border-borders rounded-full shadow-sm"><Star className="h-5 w-5 lg:h-6 lg:w-6 text-primary-text" /></div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-text mb-1">Score</p>
                <p className="font-bold text-primary-text">{displayUser.score || 0} pts</p>
              </div>
            </div>

            <div className="flex-1 p-5 lg:p-6 flex items-center gap-4 hover:bg-white/50 transition-colors">
              <div className="p-3 bg-white border border-borders rounded-full shadow-sm"><Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-primary-text" /></div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-text mb-1">Member Since</p>
                <p className="font-bold text-primary-text whitespace-nowrap">
                  {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex-1 p-5 lg:p-6 flex items-center gap-4 hover:bg-white/50 transition-colors">
              <div className="p-3 bg-white border border-borders rounded-full shadow-sm"><Activity className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600" /></div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-text mb-1">Status</p>
                <p className="font-bold text-emerald-600">Active</p>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Details */}
          <Card className="bg-[#FAF7F2] border-borders relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none mix-blend-multiply w-[300px] h-[300px]">
               <Image src="/images/samurai.png" alt="Decoration" fill className="object-contain object-right-bottom" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-4 z-10 relative">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <User className="h-5 w-5" /> Profile Details
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-white hover:bg-secondary-bg shadow-sm h-8" onClick={editing ? () => setEditing(false) : startEdit}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> {editing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 z-10 relative">
              {editing ? (
                <div className="space-y-5 bg-white p-6 rounded-xl border border-borders shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2"><Label>Full Name</Label><Input value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
                    <div className="space-y-2"><Label>College</Label><Input value={formData.collegeName} onChange={e=>setFormData({...formData, collegeName: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Branch</Label><Input value={formData.branch} onChange={e=>setFormData({...formData, branch: e.target.value})} /></div>
                    <div className="space-y-2 sm:col-span-2"><Label>Year</Label><Input value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2"><Label>Bio</Label><Textarea value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} rows={3} /></div>
                  <Button onClick={saveEdit} disabled={updateProfile.isPending} className="w-full bg-japan-red hover:bg-dark-red text-white">
                    {updateProfile.isPending ? 'Saving...' : <><Check className="w-4 h-4 mr-2"/> Save Changes</>}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-y-5">
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><User className="h-4 w-4 text-muted-text"/> Full Name</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.fullName || '-'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><Building className="h-4 w-4 text-muted-text"/> College</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.collegeName || '-'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-text"/> Branch</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.branch || '-'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-text"/> Year</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.year || '-'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><Mail className="h-4 w-4 text-muted-text"/> Email</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.email || '-'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><Phone className="h-4 w-4 text-muted-text"/> Phone</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.phone || '-'}</span></div>
                  <div className="grid grid-cols-3 items-start"><span className="text-sm font-medium text-secondary-text flex items-center gap-2 pt-0.5"><FileText className="h-4 w-4 text-muted-text"/> Bio</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.bio || '-'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><GithubIcon className="h-4 w-4 text-muted-text"/> GitHub ID</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.githubId || '-'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><Globe className="h-4 w-4 text-muted-text"/> Connection</span><span className="col-span-2 text-sm font-semibold"><Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200"><Check className="h-3 w-3 mr-1" /> Connected</Badge></span></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-[#FAF7F2] border-borders">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Settings className="h-5 w-5" /> Preferences
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-white shadow-sm h-8">
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-borders shadow-sm">
                 <div className="space-y-1">
                   <Label className="text-sm font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-muted-text"/> Email Notifications</Label>
                   <p className="text-[11px] text-muted-text font-medium">Get notified about important updates</p>
                 </div>
                 <Switch defaultChecked className="data-[state=checked]:bg-japan-red" />
               </div>
               <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-borders shadow-sm">
                 <div className="space-y-1">
                   <Label className="text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4 text-muted-text"/> Submission Updates</Label>
                   <p className="text-[11px] text-muted-text font-medium">Get notified about your submission status</p>
                 </div>
                 <Switch defaultChecked className="data-[state=checked]:bg-japan-red" />
               </div>
               <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-borders shadow-sm">
                 <div className="space-y-1">
                   <Label className="text-sm font-bold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-muted-text"/> Review Notifications</Label>
                   <p className="text-[11px] text-muted-text font-medium">Get notified about reviews and feedback</p>
                 </div>
                 <Switch defaultChecked className="data-[state=checked]:bg-japan-red" />
               </div>
               <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-borders shadow-sm">
                 <div className="space-y-1">
                   <Label className="text-sm font-bold flex items-center gap-2"><Trophy className="h-4 w-4 text-muted-text"/> Leaderboard Updates</Label>
                   <p className="text-[11px] text-muted-text font-medium">Get notified about leaderboard changes</p>
                 </div>
                 <Switch defaultChecked className="data-[state=checked]:bg-japan-red" />
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Team Info */}
          <Card className="bg-[#FAF7F2] border-borders relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply">
               <Image src="/images/task_banner.png" alt="Decoration" fill className="object-cover object-center" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-4 z-10 relative">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Users className="h-5 w-5" /> Team Information
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-white text-japan-red border-japan-red hover:bg-japan-red/5 shadow-sm h-8 font-bold">
                View Team
              </Button>
            </CardHeader>
            <CardContent className="z-10 relative">
               <div className="grid grid-cols-1 gap-y-5">
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><Users className="h-4 w-4 text-muted-text"/> Team</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.team ? displayUser.team.name : 'Not in a team yet'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><User className="h-4 w-4 text-muted-text"/> Team Role</span><span className="col-span-2 text-sm font-semibold text-primary-text capitalize">{displayUser.teamRole || '—'}</span></div>
                  <div className="grid grid-cols-3 items-center"><span className="text-sm font-medium text-secondary-text flex items-center gap-2"><Clock className="h-4 w-4 text-muted-text"/> Joined At</span><span className="col-span-2 text-sm font-semibold text-primary-text">{displayUser.teamJoinedAt ? new Date(displayUser.teamJoinedAt).toLocaleDateString() : '—'}</span></div>
                </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="bg-[#FAF7F2] border-borders">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Award className="h-5 w-5 text-japan-red" /> Badges
              </CardTitle>
              <Button variant="outline" size="sm" className="bg-white shadow-sm h-8 font-bold">
                View All
              </Button>
            </CardHeader>
            <CardContent className="pt-8 pb-10 flex flex-col items-center justify-center text-center bg-white mx-6 mb-6 rounded-xl border border-borders shadow-sm">
                {!badges || badges.length === 0 ? (
                  <>
                    <div className="relative w-16 h-16 rounded-full bg-secondary-bg flex items-center justify-center mb-4">
                      <NinjaStarIcon className="h-8 w-8 text-primary-text/40 drop-shadow-sm transform rotate-[15deg]" />
                    </div>
                    <h4 className="font-bold text-primary-text mb-1">No badges earned yet.</h4>
                    <p className="text-xs text-secondary-text max-w-[200px] leading-relaxed">Complete tasks and achievements to earn badges!</p>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-4 w-full p-4">
                     {/* Render badges here */}
                     {badges.map((badge) => (
                        <div key={badge.id} className="flex flex-col items-center text-center gap-2">
                          <img src={badge.imageUrl || '/images/bamboo.png'} alt={badge.name} className="w-12 h-12" />
                          <span className="text-[10px] font-bold">{badge.name}</span>
                        </div>
                     ))}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[#FAF7F2] border-borders">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Activity className="h-5 w-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-6 px-6">
               <div className="bg-white rounded-xl border border-borders shadow-sm p-4">
                  {!submissions || submissions.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="relative w-14 h-14 rounded-full bg-secondary-bg flex items-center justify-center mb-4">
                        <FileText className="h-7 w-7 text-primary-text/40" />
                        <NinjaStarIcon className="absolute -bottom-1 -right-1 h-6 w-6 text-primary-text drop-shadow-sm transform rotate-45" />
                      </div>
                      <h4 className="font-bold text-primary-text mb-1 text-sm">No recent activity</h4>
                      <p className="text-xs text-secondary-text leading-relaxed">Your recent actions will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.slice(0, 4).map((sub) => (
                        <div key={sub.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-japan-red/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Send className="h-4 w-4 text-japan-red" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary-text">
                              Submitted <span className="font-bold">{sub.taskTitle || 'a task'}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-text">
                                {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-muted-text">•</span>
                              <span className="text-xs text-muted-text capitalize">{sub.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

function ExternalLinkIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}
