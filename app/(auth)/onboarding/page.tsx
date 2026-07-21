'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { completeProfileSchema, type CompleteProfileForm } from '@/lib/validators/schemas';
import { useCompleteProfile } from '@/hooks/useSession';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const completeProfile = useCompleteProfile();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompleteProfileForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(completeProfileSchema) as any,
  });

  const onSubmit = (data: CompleteProfileForm) => {
    completeProfile.mutate(data);
  };

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-japan-red flex items-center justify-center">
              <span className="text-white font-serif font-bold text-sm">J</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-primary-text mb-2">
            Complete Your Profile
          </h1>
          <p className="text-secondary-text">
            Tell us about yourself to get started on your journey.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-card-bg rounded-lg border border-borders p-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Jane Doe" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* College Name */}
          <div className="space-y-2">
            <Label htmlFor="collegeName">College / University</Label>
            <Input id="collegeName" placeholder="MIT" {...register('collegeName')} />
            {errors.collegeName && (
              <p className="text-xs text-red-600">{errors.collegeName.message}</p>
            )}
          </div>

          {/* Branch + Year — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch / Major</Label>
              <Input id="branch" placeholder="Computer Science" {...register('branch')} />
              {errors.branch && (
                <p className="text-xs text-red-600">{errors.branch.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select onValueChange={(val) => setValue('year', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                  <SelectItem value="5th">5th Year</SelectItem>
                  <SelectItem value="Graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
              {errors.year && (
                <p className="text-xs text-red-600">{errors.year.message}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="+91 98765 43210" {...register('phone')} />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              className="min-h-20"
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-xs text-red-600">{errors.bio.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={completeProfile.isPending}
          >
            {completeProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
