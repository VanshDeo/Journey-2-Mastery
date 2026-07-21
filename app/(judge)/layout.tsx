import RoleGuard from '@/components/shared/RoleGuard';
import AppSidebar from '@/components/shared/AppSidebar';

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="judge">
      <AppSidebar role="judge">
        {children}
      </AppSidebar>
    </RoleGuard>
  );
}
