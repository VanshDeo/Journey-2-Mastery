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
  const [description, setDescription] = useState(task.description);
  const [points, setPoints] = useState(task.points);
  const [isActive, setIsActive] = useState(task.isActive ?? true);

  const handleSave = () => {
    updateTask.mutate(
      { id, title, description, points, isActive },
      { onSuccess: () => toast.success('Task updated') }
    );
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px]" /></div>
        <div className="space-y-2"><Label>Points</Label><Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} /></div>
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
