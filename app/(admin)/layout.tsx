import RoleGuard from '@/components/shared/RoleGuard';
import AppSidebar from '@/components/shared/AppSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="admin">
      <AppSidebar role="admin">
        {children}
      </AppSidebar>
    </RoleGuard>
  );
}
