'use client';

import { useState } from 'react';
import { useTasks, useTaskCategories } from '@/hooks/queries/useTasks';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Difficulty } from '@/types/api.types';

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [tab, setTab] = useState('all');

  const { data: categories } = useTaskCategories();
  const { data: tasks, isLoading, isError, error, refetch } = useTasks({
    search: search || undefined,
    category: category || undefined,
    difficulty: difficulty || undefined,
  });

  if (isLoading) return <LoadingSkeleton variant="card-grid" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text">Tasks</h1>
        <p className="text-secondary-text mt-1">Browse and complete tasks to earn points and rank up.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-48">
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
          <SelectTrigger className="w-full sm:w-40">
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

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {!tasks || tasks.length === 0 ? (
            <EmptyState icon="list" title="No tasks found" message="Try adjusting your filters." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 stagger-fade">
              {tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <Card className="h-full hover:shadow-md hover:border-japan-red/20 transition-all duration-200 cursor-pointer group">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-serif text-lg font-semibold text-primary-text group-hover:text-japan-red transition-colors line-clamp-1">
                          {task.title}
                        </h3>
                        <Badge variant="outline" className={difficultyColors[task.difficulty]}>
                          {task.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-text line-clamp-2 flex-1 mb-4">{task.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-borders">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-japan-red">{task.points} pts</span>
                          {task.categoryName && (
                            <span className="text-xs text-muted-text">{task.categoryName}</span>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-text group-hover:text-japan-red transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
