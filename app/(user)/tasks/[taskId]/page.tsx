'use client';

import { useTaskDetail } from '@/hooks/queries/useTasks';
import { useSubmissions, useCreateSubmission } from '@/hooks/queries/useSubmissions';
import { useGithubRepos } from '@/hooks/queries/useUser';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Clock, Users, BarChart, ExternalLink, Code2, Globe, FileText } from 'lucide-react';
import MarkdownPreview from '@/components/shared/MarkdownPreview';
import CommentThread from '@/components/shared/CommentThread';
import Link from 'next/link';
import Image from 'next/image';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const { data: task, isLoading: isTaskLoading, isError: isTaskError, error: taskError, refetch: refetchTask } = useTaskDetail(taskId);
  const { data: submissions } = useSubmissions();
  
  const { data: repos, isLoading: isReposLoading, isError: isReposError, refetch: refetchRepos } = useGithubRepos(true);
  const submitMutation = useCreateSubmission();
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');

  const isSubmitted = submissions?.some((sub) => sub.taskId === taskId && sub.status !== 'rejected');
  
  const selectedRepo = repos?.find((r) => r.repoId === selectedRepoId);

  const handleSubmit = () => {
    if (!selectedRepo || isSubmitted) return;
    submitMutation.mutate(
      {
        taskId,
        repoId: selectedRepo.repoId,
        repoUrl: selectedRepo.htmlUrl,
        repoName: selectedRepo.name,
      },
      {
        onSuccess: () => {
          toast.success('Submission created successfully!');
          setSelectedRepoId(null);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to submit');
        },
      }
    );
  };
  
  if (isTaskLoading) return <LoadingSkeleton variant="detail" />;
  if (isTaskError) return <ErrorState error={taskError} onRetry={refetchTask} />;
  if (!task) return null;

  return (
    <div className="space-y-6 animate-in pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-text">
        <Link href="/tasks" className="hover:text-japan-red transition-colors font-medium">Challenges</Link>
        <span>&gt;</span>
        <span className="text-primary-text font-medium">{task.title}</span>
      </div>

      {/* Hero Banner Area */}
      <div className="flex flex-col md:flex-row bg-[#F7F3EE] border border-borders rounded-xl overflow-hidden shadow-sm relative">
        {/* Banner Image */}
        <div className="relative w-full md:w-1/3 h-48 md:h-auto min-h-[240px]">
          <Image 
            src="/images/task_banner.png" 
            alt="Challenge Banner" 
            fill 
            className="object-cover border-r border-borders"
          />
          <div className="absolute top-4 right-4 bg-japan-red text-white text-[10px] font-bold px-2 py-1 rounded-sm tracking-widest">
            {task.difficulty ? task.difficulty.toUpperCase() : 'INTERMEDIATE'}
          </div>
        </div>
        
        {/* Banner Content */}
        <div className="relative p-8 md:p-12 flex-1 flex flex-col justify-center bg-background">
          <div className="relative z-10">
            <h1 className="font-onari text-5xl md:text-6xl text-primary-text mb-4 uppercase tracking-wide leading-[1.1]">
              {task.title}
            </h1>
            <p className="text-secondary-text mb-8 max-w-md lg:max-w-lg text-sm leading-relaxed font-medium">
              {task.shortDescription || `${task.categoryName || task.category || 'Challenge'} Task`}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-secondary-text font-semibold">
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-muted-text" />
                <span className="capitalize">{task.difficulty || 'Intermediate'}</span>
              </div>
              {task.rankRequired && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-text" />
                  <span>Rank: {task.rankRequired}</span>
                </div>
              )}
            </div>
          </div>

          {/* Decorative Character Image Blended in Right */}
          <div 
            className="absolute right-0 bottom-0 h-full w-1/2 pointer-events-none mix-blend-multiply opacity-60 hidden md:block"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
          >
            <Image 
              src="/images/avatar-ronin.png" 
              alt="Ronin Character" 
              fill 
              className="object-contain object-right scale-110" 
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left content, Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* LEFT COLUMN */}
        <div className={`space-y-8 min-w-0 ${activeTab === 'details' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b border-borders rounded-none bg-transparent h-auto p-0 gap-8 overflow-x-auto">
              <TabsTrigger 
                value="details" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-japan-red data-[state=active]:text-japan-red text-muted-text font-bold uppercase tracking-wider py-3 px-0 bg-transparent data-[state=active]:shadow-none"
              >
                Task Details
              </TabsTrigger>
              <TabsTrigger 
                value="requirements" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-japan-red data-[state=active]:text-japan-red text-muted-text font-bold uppercase tracking-wider py-3 px-0 bg-transparent data-[state=active]:shadow-none"
              >
                Requirements
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="hidden lg:inline-flex rounded-none border-b-2 border-transparent data-[state=active]:border-japan-red data-[state=active]:text-japan-red text-muted-text font-bold uppercase tracking-wider py-3 px-0 bg-transparent data-[state=active]:shadow-none"
              >
                Submissions
              </TabsTrigger>

              <TabsTrigger 
                value="discussions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-japan-red data-[state=active]:text-japan-red text-muted-text font-bold uppercase tracking-wider py-3 px-0 bg-transparent data-[state=active]:shadow-none"
              >
                Discussions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-8 space-y-8 relative">
              <div className="w-full">
                <section className="mb-10">
                  <MarkdownPreview content={task.description} />
                </section>

                {task.rubric && (
                  <section className="mt-10 pt-10 border-t border-borders">
                    <MarkdownPreview content={task.rubric} />
                  </section>
                )}
              </div>

              {/* Deliverables Section */}
              <section className="bg-card-bg border border-borders rounded-xl p-8 mt-16 relative z-10 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-6">
                  Deliverables
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="flex flex-col gap-3 bg-white p-4 border border-borders rounded-lg hover:border-japan-red/30 transition-colors relative">
                    <div className="absolute -top-2.5 -right-2 bg-japan-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest">NEW</div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 border border-borders rounded bg-card-bg">
                        <Code2 className="w-4 h-4 text-primary-text" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xs">GitHub Repository</h4>
                        <p className="text-[10px] text-muted-text mt-1 leading-tight font-medium">Submit your project GitHub repository link</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission form block */}
                <div className="mt-8 pt-8 border-t border-borders">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-4">
                     Submit Your GitHub Repository
                   </h3>
                   <div className="flex flex-col md:flex-row gap-4">
                     <div className="relative flex-1">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                         <Code2 className="w-5 h-5 text-primary-text" />
                       </div>
                       <Select
                         value={selectedRepoId || undefined}
                         onValueChange={(val) => setSelectedRepoId(val)}
                         disabled={isSubmitted}
                       >
                         <SelectTrigger className="w-full pl-12 pr-4 py-3 h-auto bg-white border border-borders rounded-lg text-sm font-medium focus:outline-none focus:border-japan-red focus:ring-1 focus:ring-japan-red/20 transition-all data-[placeholder]:text-muted-text">
                           <SelectValue placeholder="Select a repository to submit" />
                         </SelectTrigger>
                         <SelectContent>
                           {isReposLoading ? (
                             <div className="p-2 text-sm text-muted-text text-center animate-pulse">Loading repositories...</div>
                           ) : isReposError ? (
                             <div className="p-2 text-sm text-red-500 text-center">Failed to load repos</div>
                           ) : repos?.length === 0 ? (
                             <div className="p-2 text-sm text-muted-text text-center">No repositories found.</div>
                           ) : (
                             repos?.map((repo) => (
                               <SelectItem key={repo.repoId} value={repo.repoId}>
                                 {repo.name}
                               </SelectItem>
                             ))
                           )}
                         </SelectContent>
                       </Select>
                     </div>
                     <button 
                       onClick={() => refetchRepos()}
                       disabled={isReposLoading || isSubmitted}
                       className="px-6 py-3 border border-borders bg-white hover:bg-card-bg rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors text-secondary-text disabled:opacity-50"
                     >
                       <CheckCircle2 className="w-4 h-4" />
                       REFRESH REPOS
                     </button>
                   </div>
                   <p className="text-xs text-secondary-text mt-3 font-medium">
                     Make sure the repository is <span className="text-japan-red font-bold">public</span> and contains your project code.
                   </p>

                   <div className="flex flex-col md:flex-row items-center justify-between mt-10 gap-4">
                      <button className="px-6 py-3 border border-borders bg-white hover:bg-card-bg rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors text-secondary-text w-full md:w-auto">
                        <CheckCircle2 className="w-4 h-4 text-muted-text" />
                        MARK AS COMPLETE
                      </button>

                      {/* Custom brush button for submit */}
                      <button 
                        onClick={handleSubmit}
                        disabled={isSubmitted || !selectedRepo || submitMutation.isPending}
                        className="relative px-10 py-3 group w-full md:w-auto overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-[#C8473D] rounded-[4px] group-hover:bg-[#B93A32] transition-colors"></div>
                        <div className="absolute -inset-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxmaWx0ZXIgaWQ9J24nPjxmZVR1cmJ1bGVuY2UgdHlwZT0nZnJhY3RhbE5vaXNlJyBiYXNlRnJlcXVlbmN5PScwLjknIG51bU9jdGF2ZXM9JzMnIHN0aXRjaFRpbGVzPSdzdGl0Y2gnLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWx0ZXI9J3VybCgjbiknIG9wYWNpdHk9JzAuMDUnLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
                        <div className="absolute inset-0 border-[3px] border-transparent opacity-80" style={{borderImageSource: "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5,5 L95,5 L95,95 L5,95 Z\" fill=\"none\" stroke=\"%238A2722\" stroke-width=\"4\" stroke-dasharray=\"20 5\" stroke-dashoffset=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>')", borderImageSlice: "10", borderImageRepeat: "stretch"}}></div>
                        <div className="relative flex items-center justify-center gap-2 text-white font-bold tracking-widest text-sm z-10 drop-shadow-md">
                          {isSubmitted ? 'SUBMITTED' : submitMutation.isPending ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
                          <span>&gt;</span>
                        </div>
                      </button>
                   </div>
                </div>
              </section>

            </TabsContent>
            <TabsContent value="requirements" className="mt-8">
              {task.requirements ? (
                <div className="w-full">
                  <MarkdownPreview content={task.requirements} />
                </div>
              ) : (
                <div className="p-8 text-center text-muted-text bg-card-bg border border-borders rounded-xl">No specific requirements for this task.</div>
              )}
            </TabsContent>
            <TabsContent value="submissions" className="mt-8">
              {(() => {
                const taskSubmissions = submissions?.filter(s => s.taskId === taskId) || [];
                return taskSubmissions.length > 0 ? (
                  <div className="space-y-4 w-full">
                    {taskSubmissions.map(sub => (
                      <div key={sub.id} className="p-6 bg-white border border-borders rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                          <h4 className="font-bold text-primary-text mb-1 text-sm">{sub.repoName || 'GitHub Repository'}</h4>
                          <a href={sub.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-japan-red hover:underline flex items-center gap-1 font-medium">
                            <ExternalLink className="w-3 h-3" />
                            View Source
                          </a>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-text mb-2">Status</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                            sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            sub.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {sub.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-text bg-card-bg border border-borders rounded-xl">No submissions yet for this task.</div>
                );
              })()}
            </TabsContent>
            <TabsContent value="discussions" className="mt-8">
              {(() => {
                const userSubmission = submissions?.find(sub => sub.taskId === taskId);
                return userSubmission ? (
                  <div className="bg-white border border-borders rounded-xl p-8 shadow-sm">
                    <CommentThread submissionId={userSubmission.id} />
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-text bg-card-bg border border-borders rounded-xl">
                    You need to submit your project first before you can start a discussion.
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN */}
        {activeTab === 'details' && (
          <div className="space-y-6">
          
          {/* Status Card */}
          <div className="bg-card-bg border border-borders rounded-xl p-8 shadow-sm">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-8 text-primary-text">Status</h3>
            <div className="flex items-center gap-6 mb-2">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="#E5DED5" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke={isSubmitted ? "#10B981" : "#B93A32"} strokeWidth="6" strokeDasharray="263.89" strokeDashoffset={isSubmitted ? 0 : 263.89} strokeLinecap="round" />
                </svg>
                <div className={`absolute text-xl font-bold ${isSubmitted ? 'text-emerald-500' : 'text-japan-red'}`}>
                  {isSubmitted ? '100%' : '0%'}
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isSubmitted ? 'text-emerald-500' : 'text-japan-red'}`}>
                  {isSubmitted ? 'Submitted' : 'Pending'}
                </div>
                <div className="text-xs text-muted-text font-bold tracking-widest uppercase mt-1">Status</div>
              </div>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="bg-card-bg border border-borders rounded-xl p-8 shadow-sm">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-primary-text">Rewards</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl text-primary-text">XP</span>
                <span className="text-sm font-semibold text-secondary-text">{task.points} XP</span>
              </div>
            </div>
          </div>

          {/* Journey Stage Card */}
          {task.rankRequired && (
            <div className="bg-card-bg border border-borders rounded-xl p-8 relative overflow-hidden shadow-sm">
               <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-4 translate-y-4">
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 21l2-2"></path></svg>
               </div>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-6 text-primary-text relative z-10">Journey Stage</h3>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-full border-[2px] border-primary-text flex items-center justify-center text-primary-text bg-white">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 21l2-2"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-japan-red text-xl uppercase tracking-widest leading-tight">{task.rankRequired}</h4>
                </div>
              </div>
            </div>
          )}
          
        </div>
        )}

      </div>
    </div>
  );
}
