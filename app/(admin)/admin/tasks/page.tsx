'use client';

import { useState } from 'react';
import { useAdminTasks, useCreateTask, useDeleteTask } from '@/hooks/queries/useAdminDashboard';
import { useTaskCategories } from '@/hooks/queries/useTasks';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskForm } from '@/lib/validators/schemas';

export default function AdminTasksPage() {
  const { data: tasks, isLoading, isError, error, refetch } = useAdminTasks();
  const { data: categories } = useTaskCategories();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [dialogOpen, setDialogOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<TaskForm>({ resolver: zodResolver(taskSchema) as any, defaultValues: { isActive: true } });

  const handleCreate = (data: TaskForm) => {
    createTask.mutate(data, {
      onSuccess: () => {
        toast.success('Task created');
        setDialogOpen(false);
        form.reset();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const diffColors: Record<string, string> = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-primary-text">Tasks</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Create Task</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input {...form.register('title')} />{form.formState.errors.title && <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>}</div>
              <div className="space-y-2"><Label>Description</Label><Textarea {...form.register('description')} className="min-h-[100px]" />{form.formState.errors.description && <p className="text-xs text-red-600">{form.formState.errors.description.message}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Controller name="category" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                  )} />
                  {form.formState.errors.category && <p className="text-xs text-red-600">{form.formState.errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Points</Label><Input type="number" {...form.register('points')} />
                  {form.formState.errors.points && <p className="text-xs text-red-600">{form.formState.errors.points.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Controller name="difficulty" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select>
                  )} />
                  {form.formState.errors.difficulty && <p className="text-xs text-red-600">{form.formState.errors.difficulty.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Rank Req.</Label>
                  <Controller name="rankRequired" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="Ronin">Ronin</SelectItem><SelectItem value="Kenshi">Kenshi</SelectItem><SelectItem value="Samurai">Samurai</SelectItem><SelectItem value="Shogun">Shogun</SelectItem></SelectContent></Select>
                  )} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createTask.isPending}>{createTask.isPending ? 'Creating...' : 'Create Task'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!tasks || tasks.length === 0 ? (
        <EmptyState icon="list" title="No tasks" message="Create your first task to get started." />
      ) : (
        <div className="border border-borders rounded-lg overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Difficulty</TableHead><TableHead>Points</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell><Link href={`/admin/tasks/${t.id}`} className="text-sm font-medium text-primary-text hover:text-japan-red">{t.title}</Link></TableCell>
                  <TableCell><Badge variant="outline" className={diffColors[t.difficulty]}>{t.difficulty}</Badge></TableCell>
                  <TableCell className="font-semibold text-japan-red">{t.points}</TableCell>
                  <TableCell>{t.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog trigger={<Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>} title="Delete task?" description={`This will permanently delete "${t.title}".`} confirmLabel="Delete" variant="destructive" onConfirm={() => deleteTask.mutate(t.id, { onSuccess: () => toast.success('Task deleted') })} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
