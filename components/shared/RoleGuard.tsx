'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import type { Role } from '@/types/api.types';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: Role;
}

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useSession();

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      router.push('/login');
      return;
    }

    // Force-redirect to onboarding if profile is incomplete
    if (user.isProfileComplete === false && pathname !== '/onboarding') {
      router.push('/onboarding');
      return;
    }

    const userRole = user.role?.trim();
    // Role check — judges and admins can access user-side pages
    const hasAccess =
      userRole === allowedRole ||
      (allowedRole === 'user' && (userRole === 'judge' || userRole === 'admin'));

    if (!hasAccess) {
      router.push(allowedRole === 'user' ? '/login' : '/');
      return;
    }
  }, [user, isLoading, isError, allowedRole, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 p-8">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const userRole = user.role?.trim();
  const hasAccess =
    userRole === allowedRole ||
    (allowedRole === 'user' && (userRole === 'judge' || userRole === 'admin'));

  if (!hasAccess) return null;

  return <>{children}</>;
}
