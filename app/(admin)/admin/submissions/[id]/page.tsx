'use client';

import { useParams } from 'next/navigation';
import { useAdminSubmission, useAssignJudge, useOverrideReview } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import StatusBadge from '@/components/shared/StatusBadge';
import CommentThread from '@/components/shared/CommentThread';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, User, Star, UserPlus, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: submission, isLoading, isError, error, refetch } = useAdminSubmission(id);
  const assignJudge = useAssignJudge();
  const overrideReview = useOverrideReview();
  const [overrideScore, setOverrideScore] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  if (isLoading) return <LoadingSkeleton variant="detail" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!submission) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/submissions" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Submissions
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-text">{submission.taskTitle || 'Submission'}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-secondary-text">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{submission.userName}</span>
            <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <a href={submission.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-japan-red hover:text-dark-red font-medium">
            <ExternalLink className="h-4 w-4" />{submission.repoUrl.replace('https://github.com/', '')}
          </a>
        </CardContent>
      </Card>

      {/* Judge Assignment */}
      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Assigned Judge</p>
            <p className="text-sm text-muted-text">{submission.judgeName || 'Unassigned'}</p>
          </div>
          {!submission.judgeName && (
            <Button variant="outline" size="sm" onClick={() => assignJudge.mutate({ submissionId: id }, { onSuccess: () => { toast.success('Judge auto-assigned'); refetch(); } })}>
              <UserPlus className="h-4 w-4 mr-1" />Auto-Assign
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Review */}
      {submission.review && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-japan-red" />Review — {submission.review.totalScore} pts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submission.review.scores.map((s) => (
                <div key={s.criterionId} className="flex justify-between"><span className="text-sm text-secondary-text">{s.criterionName}</span><span className="text-sm font-medium">{s.score}/{s.maxScore}</span></div>
              ))}
            </div>
            {submission.review.feedback && (<><Separator className="my-4" /><p className="text-sm text-secondary-text whitespace-pre-wrap">{submission.review.feedback}</p></>)}
          </CardContent>
        </Card>
      )}

      {/* Score Override */}
      {submission.review && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-japan-red" />Admin Override</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>New Score</Label><Input type="number" value={overrideScore} onChange={(e) => setOverrideScore(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Reason</Label><Textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Reason for override..." /></div>
            <Button
              variant="outline"
              onClick={() => overrideReview.mutate({ reviewId: submission.review!.id, score: Number(overrideScore), reason: overrideReason }, {
                onSuccess: () => { toast.success('Score overridden'); refetch(); setOverrideScore(''); setOverrideReason(''); }
              })}
              disabled={!overrideScore || !overrideReason || overrideReview.isPending}
            >
              {overrideReview.isPending ? 'Overriding...' : 'Override Score'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />
      <CommentThread submissionId={id} />
    </div>
  );
}
