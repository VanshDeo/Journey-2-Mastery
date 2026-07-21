'use client';

import { useState } from 'react';
import { useGithubRepos } from '@/hooks/queries/useUser';
import { useCreateSubmission } from '@/hooks/queries/useSubmissions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitBranch, RefreshCw, Unplug, Pencil, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface GithubSubmissionBlockProps {
  taskId: string;
  isSubmitted?: boolean;
}

export default function GithubSubmissionBlock({ taskId, isSubmitted }: GithubSubmissionBlockProps) {
  const { data: repos, isLoading, isError, refetch } = useGithubRepos(true);
  const submitMutation = useCreateSubmission();
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  const selectedRepo = repos?.find((r) => r.repoId === selectedRepoId);

  const handleSubmit = () => {
    if (!selectedRepo || isSubmitted) return;
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
          setSelectedRepoId(null);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to submit');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary-text mb-1">GitHub repository</h2>
              <p className="text-sm text-secondary-text mb-4">
                Connect your GitHub account and pick a repository to submit.
              </p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 font-medium">
              Connected
            </Badge>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-muted-text" onClick={() => refetch()} disabled={isLoading}>
              <GitBranch className="h-4 w-4" />
              Reconnect GitHub
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-muted-text" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Check status
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
              <Unplug className="h-4 w-4" />
              Disconnect
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-primary-text">Choose repository</span>
            <Button variant="outline" size="sm" className="h-8 gap-2" disabled={isSubmitted}>
              <Pencil className="h-3 w-3" />
              Change
            </Button>
          </div>

          {isLoading ? (
            <div className="h-10 bg-secondary-bg animate-pulse rounded-md border border-borders w-full" />
          ) : isError ? (
            <div className="text-sm text-red-500 border border-red-200 bg-red-50 p-2 rounded-md">
              Failed to load repositories. Please try again.
            </div>
          ) : (
            <Select
              value={selectedRepoId || undefined}
              onValueChange={(val) => setSelectedRepoId(val)}
              disabled={isSubmitted}
            >
              <SelectTrigger className="w-full text-secondary-text">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repos?.length === 0 ? (
                  <div className="p-2 text-sm text-muted-text text-center">No repositories found.</div>
                ) : (
                  repos?.map((repo) => (
                    <SelectItem key={repo.repoId} value={repo.repoId}>
                      {repo.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {isSubmitted || selectedRepo ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
              ) : (
                <Clock className="h-8 w-8 text-amber-500 shrink-0" />
              )}
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-text">Task status</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={isSubmitted || selectedRepo ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-borders text-secondary-text bg-white"}
                >
                  {isSubmitted ? 'Submitted' : selectedRepo ? 'Ready for review' : 'Awaiting submission'}
                </Badge>
              </div>

              <div className="hidden sm:block h-10 w-px bg-borders mx-4" />
              
              <p className="text-sm text-secondary-text hidden sm:block">
                {isSubmitted 
                  ? 'You have successfully submitted this task.'
                  : selectedRepo 
                    ? 'All required fields are complete. You can submit now.' 
                    : 'Complete all required submission fields to continue.'}
              </p>
            </div>

            <Button 
              size="lg"
              onClick={handleSubmit} 
              disabled={isSubmitted || !selectedRepo || submitMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600 text-white w-full sm:w-auto"
            >
              {isSubmitted ? 'Submitted' : submitMutation.isPending ? 'Submitting...' : 'Submit for review'}
            </Button>
          </div>
          
          {/* Mobile only description */}
          <p className="text-sm text-secondary-text mt-4 sm:hidden">
            {isSubmitted 
              ? 'You have successfully submitted this task.'
              : selectedRepo 
                ? 'All required fields are complete. You can submit now.' 
                : 'Complete all required submission fields to continue.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
