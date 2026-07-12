import RoleGuard from '@/components/shared/RoleGuard';
import AppSidebar from '@/components/shared/AppSidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="user">
      <AppSidebar role="user">
        {children}
      </AppSidebar>
    </RoleGuard>
  );
}
