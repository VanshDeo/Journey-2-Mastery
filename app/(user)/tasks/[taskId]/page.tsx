'use client';

import { useTaskDetail } from '@/hooks/queries/useTasks';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
import { useParams } from 'next/navigation';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import StatusBadge from '@/components/shared/StatusBadge';
import MarkdownPreview from '@/components/shared/MarkdownPreview';
import GithubSubmissionBlock from '@/components/user/GithubSubmissionBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, BarChart3, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const { data: task, isLoading: isTaskLoading, isError: isTaskError, error: taskError, refetch: refetchTask } = useTaskDetail(taskId);
  const { data: submissions } = useSubmissions();

  if (isTaskLoading) return <LoadingSkeleton variant="detail" />;
  if (isTaskError) return <ErrorState error={taskError} onRetry={refetchTask} />;
  if (!task) return null;

  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  };

  const isSubmitted = submissions?.some((sub) => sub.taskId === taskId && sub.status !== 'rejected');
  const taskSubmissions = submissions?.filter((sub) => sub.taskId === taskId) ?? [];

  return (
    <div className="space-y-6">
      <Link href="/tasks" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-serif text-3xl font-bold text-primary-text">{task.title}</h1>
          <Badge variant="outline" className={diffColors[task.difficulty] || ''}>
            {task.difficulty}
          </Badge>
        </div>
        {task.categoryName && <p className="text-sm text-muted-text">{task.categoryName}</p>}
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main details & submission flow) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownPreview content={task.description} />
            </CardContent>
          </Card>

          {/* Rubric Preview */}
          {task.rubric && (
            <Card>
              <CardHeader>
                <CardTitle>Rubric</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownPreview content={task.rubric} />
              </CardContent>
            </Card>
          )}

          {/* Submit Block */}
          <GithubSubmissionBlock taskId={taskId} isSubmitted={isSubmitted} />
        </div>

        {/* Right Column (Sidebar task info & submissions) */}
        <div className="space-y-6">
          {/* Task Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm pb-3 border-b border-borders/50">
                <span className="text-muted-text flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-japan-red" />
                  Points
                </span>
                <span className="font-bold text-primary-text">{task.points} pts</span>
              </div>
              <div className="flex items-center justify-between text-sm pb-3 border-b border-borders/50">
                <span className="text-muted-text flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-japan-red" />
                  Difficulty
                </span>
                <span className={cn('px-2 py-0.5 rounded text-xs font-semibold capitalize', diffColors[task.difficulty])}>
                  {task.difficulty}
                </span>
              </div>
              {task.rankRequired && (
                <div className="flex items-center justify-between text-sm pb-3 border-b border-borders/50">
                  <span className="text-muted-text flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-japan-red" />
                    Required Rank
                  </span>
                  <RankBadge rank={task.rankRequired} size="sm" />
                </div>
              )}
              {task.categoryName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-text">Category</span>
                  <span className="font-medium text-secondary-text">{task.categoryName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User's Submissions for this Task */}
          {taskSubmissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {taskSubmissions.map((sub) => (
                  <Link key={sub.id} href={`/submissions/${sub.id}`} className="block">
                    <div className="p-3 rounded-lg border border-borders bg-card-bg hover:bg-secondary-bg hover:border-japan-red/20 transition-all text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-secondary-text truncate max-w-[120px]">
                          {sub.repoName || 'Repository'}
                        </span>
                        <StatusBadge status={sub.status} />
                      </div>
                      <div className="flex items-center justify-between text-muted-text">
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                        {sub.score !== undefined && sub.score !== null && (
                          <span className="font-bold text-japan-red">{sub.score} pts</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
