'use client';

import { useState, useMemo } from 'react';
import { useJudgeCriteria } from '@/hooks/queries/useJudgeQueue';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface ScoreRubricFormProps {
  taskType?: string;
  onSubmit: (scores: { criterionId: string; score: number }[], feedback: string) => void;
  isPending?: boolean;
  initialScores?: { criterionId: string; score: number }[];
  initialFeedback?: string;
}

export default function ScoreRubricForm({
  taskType,
  onSubmit,
  isPending = false,
  initialScores,
  initialFeedback = '',
}: ScoreRubricFormProps) {
  const { data: criteria, isLoading } = useJudgeCriteria(taskType);
  const [scores, setScores] = useState<Record<string, number>>(
    initialScores?.reduce((acc, s) => ({ ...acc, [s.criterionId]: s.score }), {} as Record<string, number>) || {}
  );
  const [feedback, setFeedback] = useState(initialFeedback);

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, s) => sum + (s || 0), 0);
  }, [scores]);

  const maxTotal = useMemo(() => {
    return criteria?.reduce((sum, c) => sum + c.maxScore, 0) || 0;
  }, [criteria]);

  const handleScoreChange = (criterionId: string, value: string, maxScore: number) => {
    const num = Math.min(Math.max(0, parseInt(value) || 0), maxScore);
    setScores((prev) => ({ ...prev, [criterionId]: num }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreEntries = Object.entries(scores).map(([criterionId, score]) => ({
      criterionId,
      score,
    }));
    onSubmit(scoreEntries, feedback);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {criteria?.map((criterion) => (
          <div key={criterion.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-borders bg-card-bg">
            <div className="flex-1 min-w-0">
              <Label className="font-medium">{criterion.name}</Label>
              <p className="text-xs text-muted-text mt-0.5">{criterion.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                type="number"
                min={0}
                max={criterion.maxScore}
                value={scores[criterion.id] ?? ''}
                onChange={(e) => handleScoreChange(criterion.id, e.target.value, criterion.maxScore)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-text">/ {criterion.maxScore}</span>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Live Total */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary-bg">
        <span className="font-serif font-semibold text-primary-text">Total Score</span>
        <span className="text-2xl font-bold text-japan-red">
          {totalScore} <span className="text-sm font-normal text-muted-text">/ {maxTotal}</span>
        </span>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide detailed feedback for the submission..."
          className="min-h-[120px]"
        />
      </div>

      <Button type="submit" disabled={isPending || !feedback.trim()} className="w-full">
        {isPending ? 'Submitting Review...' : 'Submit Review'}
      </Button>
    </form>
  );
}
