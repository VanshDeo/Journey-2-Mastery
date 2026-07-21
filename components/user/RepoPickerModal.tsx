'use client';

import { useState } from 'react';
import { useGithubRepos } from '@/hooks/queries/useUser';
import { useCreateSubmission } from '@/hooks/queries/useSubmissions';
import type { RepoInfo } from '@/types/api.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/shared/ErrorState';
import { GitBranch, Star, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RepoPickerModalProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RepoPickerModal({ taskId, open, onOpenChange }: RepoPickerModalProps) {
  const { data: repos, isLoading, isError, error, refetch } = useGithubRepos(open);
  const submitMutation = useCreateSubmission();
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);
  const [search, setSearch] = useState('');

  const filteredRepos = repos?.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedRepo) return;
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
          onOpenChange(false);
          setSelectedRepo(null);
          setSearch('');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to submit');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Repository</DialogTitle>
          <DialogDescription>Choose a GitHub repository to submit for this task.</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="pl-9"
          />
        </div>

        {/* Repo List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 py-2">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : filteredRepos?.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-text">
              {search ? 'No repositories match your search.' : 'No public repositories found.'}
            </div>
          ) : (
            filteredRepos?.map((repo) => (
              <button
                key={repo.repoId}
                type="button"
                onClick={() => setSelectedRepo(repo)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer',
                  selectedRepo?.repoId === repo.repoId
                    ? 'border-japan-red bg-japan-red/5 shadow-sm'
                    : 'border-borders bg-card-bg hover:border-japan-red/30'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-text shrink-0" />
                      <span className="font-medium text-primary-text truncate">{repo.name}</span>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-secondary-text mt-1 line-clamp-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-text">
                      {repo.language && <span>{repo.language}</span>}
                      {repo.stargazersCount !== undefined && repo.stargazersCount > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3" /> {repo.stargazersCount}
                        </span>
                      )}
                      <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedRepo || submitMutation.isPending}>
            {submitMutation.isPending ? 'Submitting...' : 'Submit Repository'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
