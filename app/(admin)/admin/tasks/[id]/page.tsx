'use client';

import { useParams } from 'next/navigation';
import { useAdminTasks, useUpdateTask } from '@/hooks/queries/useAdminDashboard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Task } from '@/types/api.types';

function EditForm({ task, id }: { task: Task; id: string }) {
  const updateTask = useUpdateTask();
  const [title, setTitle] = useState(task.title);
  const [shortDescription, setShortDescription] = useState(task.shortDescription || '');
  const [description, setDescription] = useState(task.description);
  const [requirements, setRequirements] = useState(task.requirements || '');
  const [points, setPoints] = useState(task.points);
  const [bonusPoints, setBonusPoints] = useState(task.bonusPoints || 0);
  const [deadline, setDeadline] = useState(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
  const [isActive, setIsActive] = useState(task.isActive ?? true);

  const handleSave = () => {
    updateTask.mutate(
      { 
        id, title, shortDescription, description, requirements, 
        points, bonusPoints, deadline: deadline ? new Date(deadline).toISOString() : undefined, isActive 
      },
      { onSuccess: () => toast.success('Task updated') }
    );
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Short Description</Label><Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="A quick summary..." /></div>
        <div className="space-y-2"><Label>Task Details (Markdown)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-30 font-mono text-sm" /></div>
        <div className="space-y-2"><Label>Requirements (Markdown)</Label><Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="min-h-30 font-mono text-sm" /></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Points</Label><Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Bonus Points</Label><Input type="number" value={bonusPoints} onChange={(e) => setBonusPoints(Number(e.target.value))} /></div>
        </div>

        <div className="space-y-2"><Label>Deadline</Label><Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>

        <div className="flex items-center justify-between rounded-lg border border-borders p-4">
          <div><Label>Active</Label><p className="text-xs text-muted-text">Allow new submissions</p></div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <Button onClick={handleSave} disabled={updateTask.isPending} className="w-full">
          <Save className="h-4 w-4 mr-2" />{updateTask.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminTaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: tasks, isLoading, isError, error, refetch } = useAdminTasks();
  const task = tasks?.find((t) => t.id === id);

  if (isLoading) return <LoadingSkeleton variant="form" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!task) return <ErrorState error="Task not found" />;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/tasks" className="inline-flex items-center gap-1 text-sm text-muted-text hover:text-primary-text transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </Link>

      <h1 className="font-serif text-2xl font-bold text-primary-text">Edit Task</h1>

      <EditForm task={task} id={id} />
    </div>
  );
}
