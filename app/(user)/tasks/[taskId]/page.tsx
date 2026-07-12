'use client';

import { useTaskDetail } from '@/hooks/queries/useTasks';
import { useSubmissions } from '@/hooks/queries/useSubmissions';
import { useParams } from 'next/navigation';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import RankBadge from '@/components/shared/RankBadge';
import MarkdownPreview from '@/components/shared/MarkdownPreview';
import GithubSubmissionBlock from '@/components/user/GithubSubmissionBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, BarChart3, Trophy } from 'lucide-react';
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

  return (
    <div className="max-w-3xl space-y-6">
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Star className="h-5 w-5 text-japan-red" />
            <div>
              <p className="text-xs text-muted-text">Points</p>
              <p className="font-bold text-primary-text">{task.points}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-japan-red" />
            <div>
              <p className="text-xs text-muted-text">Difficulty</p>
              <p className="font-bold text-primary-text capitalize">{task.difficulty}</p>
            </div>
          </CardContent>
        </Card>
        {task.rankRequired && (
          <Card>
            <CardContent className="pt-4 flex items-center gap-3">
              <Trophy className="h-5 w-5 text-japan-red" />
              <div>
                <p className="text-xs text-muted-text">Rank Required</p>
                <RankBadge rank={task.rankRequired} size="sm" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
  );
}
