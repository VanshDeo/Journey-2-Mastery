'use client';

import { useState, useCallback } from 'react';
import { useUploadPostImage } from '@/hooks/queries/usePosts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PostEditorProps {
  initialData?: {
    title: string;
    description: string;
    posterImageUrl?: string;
    isPublished: boolean;
  };
  onSubmit: (data: { title: string; description: string; posterImageUrl?: string; isPublished: boolean }) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function PostEditor({ initialData, onSubmit, isPending = false, submitLabel = 'Create Post' }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [posterImageUrl, setPosterImageUrl] = useState(initialData?.posterImageUrl || '');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const [isDragging, setIsDragging] = useState(false);
  const uploadImage = useUploadPostImage();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    try {
      const result = await uploadImage.mutateAsync(file);
      setPosterImageUrl(result.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
  }, [uploadImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, posterImageUrl: posterImageUrl || undefined, isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <Label>Cover Image</Label>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'mt-2 border-2 border-dashed rounded-lg transition-colors relative',
            isDragging ? 'border-japan-red bg-japan-red/5' : 'border-borders',
            posterImageUrl ? 'p-0' : 'p-8'
          )}
        >
          {posterImageUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src={posterImageUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPosterImageUrl('')}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              {uploadImage.isPending ? (
                <Loader2 className="h-8 w-8 text-muted-text animate-spin" />
              ) : (
                <ImagePlus className="h-8 w-8 text-muted-text" />
              )}
              <span className="text-sm text-muted-text">
                Drag & drop an image, or click to browse
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="post-desc">Description</Label>
        <Textarea
          id="post-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write the post content..."
          className="min-h-[160px]"
        />
      </div>

      {/* Publish Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-borders p-4">
        <div>
          <Label>Publish</Label>
          <p className="text-xs text-muted-text">Make this post visible to all users</p>
        </div>
        <Switch checked={isPublished} onCheckedChange={setIsPublished} />
      </div>

      <Button type="submit" disabled={isPending || !title.trim() || !description.trim()} className="w-full">
        {isPending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
