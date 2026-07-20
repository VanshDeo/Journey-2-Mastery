'use client';

import { useState } from 'react';
import { useTasks, useTaskCategories, useCompletedTasks, usePendingTasks } from '@/hooks/queries/useTasks';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Clock, Hourglass, CheckCircle2, Trophy, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Difficulty, Task, Submission } from '@/types/api.types';

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  hard: 'bg-red-50 text-red-600 border-red-200',
};

function NinjaStarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C12 1.5 13.5 8 17 10C19.5 11.5 22.5 12 22.5 12C22.5 12 19.5 12.5 17 14C13.5 16 12 22.5 12 22.5C12 22.5 10.5 16 7 14C4.5 12.5 1.5 12 1.5 12C1.5 12 4.5 11.5 7 10C10.5 8 12 1.5 12 1.5ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
    </svg>
  );
}

const avatars = ['/images/avatar-ronin.png', '/images/samurai.png', '/images/avatar-ronin.png'];
const landscapes = ['/images/landscape-torii.png', '/images/landscape-temple.png'];

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [tab, setTab] = useState('all');

  const { data: categories } = useTaskCategories();
  const { data: availableTasks, isLoading: isAvailLoading, isError, error, refetch } = useTasks({
    search: search || undefined,
    category: category || undefined,
    difficulty: difficulty || undefined,
  });

  const { data: completedSubmissions, isLoading: isCompLoading } = useCompletedTasks();
  const { data: pendingSubmissions, isLoading: isPendLoading } = usePendingTasks();

  const isLoading = isAvailLoading || isCompLoading || isPendLoading;

  const completedTasks = completedSubmissions?.map((s) => s.task as Task) || [];
  const pendingTasks = pendingSubmissions?.map((s) => s.task as Task) || [];

  const filterTasks = (taskList: Task[]) => {
    return taskList.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && t.category !== category) return false;
      if (difficulty && t.difficulty !== difficulty) return false;
      return true;
    });
  };

  let tasks: Task[] = [];
  if (tab === 'all') {
    tasks = availableTasks || [];
  } else if (tab === 'pending') {
    tasks = filterTasks(pendingTasks);
  } else if (tab === 'completed') {
    tasks = filterTasks(completedTasks);
  }

  if (isLoading) return <LoadingSkeleton variant="card-grid" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in">
      {/* Header */}
      <div className="mb-6 relative">
        <h1 className="font-serif text-4xl font-bold text-primary-text flex items-center gap-3">
          Tasks
          <NinjaStarIcon className="w-7 h-7 text-primary-text opacity-90 drop-shadow-sm" />
        </h1>
        <p className="text-sm text-secondary-text mt-2">Browse and complete tasks to earn points and rank up.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 h-11 bg-white border-borders shadow-sm rounded-lg"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full md:w-56 h-11 bg-white border-borders rounded-lg">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full md:w-48 h-11 bg-white border-borders rounded-lg">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Tabs */}
      <div className="flex items-center gap-8 mt-8 mb-6 px-4 border-b border-borders pb-4">
        <button 
          onClick={() => setTab('all')} 
          className={cn('font-bold text-sm px-5 py-1.5 rounded-full transition-colors', tab === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-primary-text hover:text-japan-red')}
        >
          <span>All Tasks</span>
        </button>
        <button 
          onClick={() => setTab('pending')} 
          className={cn('font-semibold text-sm flex items-center gap-2 transition-colors', tab === 'pending' ? 'text-primary-text' : 'text-secondary-text hover:text-primary-text')}
        >
          <Hourglass className="w-4 h-4" /> Pending
        </button>
        <button 
          onClick={() => setTab('completed')} 
          className={cn('font-semibold text-sm flex items-center gap-2 transition-colors', tab === 'completed' ? 'text-primary-text' : 'text-secondary-text hover:text-primary-text')}
        >
          <CheckCircle2 className="w-4 h-4" /> Completed
        </button>
      </div>

      {/* Task List */}
      {!tasks || tasks.length === 0 ? (
        <EmptyState icon="list" title="No tasks found" message="Try adjusting your filters." />
      ) : (
        <div className="space-y-4 mt-6">
          {tasks.map((task, index) => {
            const avatar = avatars[index % avatars.length];
            const landscape = landscapes[index % landscapes.length];
            const isBlackBrush = index % 2 === 1;

            return (
              <Card key={task.id} className={cn(
                "relative overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm rounded-xl hover:shadow-md transition-shadow group border-y border-r border-borders",
                isBlackBrush ? "border-l-8 border-l-zinc-800" : "border-l-8 border-l-japan-red"
              )}>
                {/* Right Landscape Decor with Smooth Fade */}
                <div 
                  className="absolute -right-8 top-0 bottom-0 w-3/4 md:w-1/2 z-0 opacity-40 pointer-events-none"
                  style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
                >
                  <Image src={landscape} alt="bg" fill className="object-cover object-right mix-blend-multiply scale-110 translate-x-[5%]" />
                </div>

                <CardContent className="p-6 md:pl-10 flex flex-col md:flex-row items-center justify-between relative z-20 gap-6">
                  {/* Left: Avatar + Details */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7 max-w-3xl flex-1">
                    <div className="w-40 h-40 rounded-full bg-white border border-borders shadow-sm shrink-0 overflow-hidden relative">
                      <Image src={avatar} alt={task.title} fill className="object-contain p-2" />
                    </div>
                    
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                      <h3 className="font-serif text-2xl font-bold text-primary-text flex items-center gap-2">
                        <NinjaStarIcon className="w-5 h-5 text-japan-red" />
                        {task.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                        <Badge className="bg-[#FAF7F2] border-borders text-secondary-text font-medium px-2.5 py-0.5 rounded text-[11px] shadow-sm">
                          Level {index + 1} • {task.categoryName || 'Beginner'}
                        </Badge>
                        <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[11px] capitalize", difficultyColors[task.difficulty])}>
                          {task.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-secondary-text mt-3 line-clamp-2 leading-relaxed max-w-xl">
                        {task.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4 text-xs font-semibold text-muted-text">
                        {task.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> 
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {task.status && (
                          <span className="flex items-center gap-1.5 text-japan-red">
                            <Activity className="w-4 h-4" />
                            Status: <span className="capitalize">{task.status.replace('_', ' ')}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4" />
                          Reward: {task.points} pts {task.bonusPoints ? `(+${task.bonusPoints} bonus)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Points + Button */}
                  <div className="flex flex-col items-center justify-center gap-4 min-w-30 shrink-0">
                    <div className="text-center">
                      <div className="font-serif text-3xl font-bold text-japan-red drop-shadow-sm">{task.points} pts</div>
                      <div className="text-xs font-bold text-secondary-text mt-1 uppercase tracking-wider">Total Points</div>
                    </div>
                    <Button asChild variant="outline" className="bg-white/80 backdrop-blur-sm border-japan-red/30 text-japan-red hover:bg-japan-red hover:text-white rounded-full px-6 py-4 font-semibold shadow-sm transition-colors w-full">
                      <Link href={`/tasks/${task.id}`}>
                        View Tasks &rarr;
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
