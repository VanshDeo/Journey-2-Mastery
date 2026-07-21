'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

function CallbackLogic() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(true);

  useEffect(() => {
    // Reset session query to discard any cached errors/stale sessions from /login
    queryClient.resetQueries({ queryKey: ['session'] }).then(() => {
      setIsResetting(false);
    });
  }, [queryClient]);

  const { data: user, isLoading, isError } = useSession();

  useEffect(() => {
    if (isResetting || isLoading) return;

    if (isError || !user) {
      router.push('/login');
      return;
    }

    const userRole = user.role?.trim();
    if (!user.isProfileComplete) {
      router.push('/onboarding');
    } else {
      if (userRole === 'admin') router.push('/admin');
      else if (userRole === 'judge') router.push('/judge');
      else router.push('/dashboard');
    }
  }, [user, isLoading, isError, isResetting, router]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 text-japan-red animate-spin" />
      <p className="text-secondary-text text-sm">Completing login...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-japan-red animate-spin" />
            <p className="text-secondary-text text-sm">Loading...</p>
          </div>
        }
      >
        <CallbackLogic />
      </Suspense>
    </div>
  );
}
