'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, useLogout } from '@/hooks/useSession';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import RankBadge from '@/components/shared/RankBadge';
import NotificationBell from '@/components/shared/NotificationBell';
import {
  LayoutDashboard, ListChecks, Send, Trophy, FileText, User, Bell, Settings,
  Scale, ClipboardList, Star, Users, Shield, BookOpen, BarChart3, Newspaper,
  FileBarChart, LogOut, Menu, PanelLeft,
} from 'lucide-react';
import type { Role } from '@/types/api.types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const userNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tasks', href: '/tasks', icon: ListChecks },
  { label: 'Submissions', href: '/submissions', icon: Send },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Posts', href: '/posts', icon: FileText },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const judgeNav: NavItem[] = [
  { label: 'Dashboard', href: '/judge', icon: LayoutDashboard },
  { label: 'Review Queue', href: '/judge/queue', icon: ClipboardList },
  { label: 'My Reviews', href: '/judge/reviews', icon: Star },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Posts', href: '/posts', icon: FileText },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Judges', href: '/admin/judges', icon: Scale },
  { label: 'Tasks', href: '/admin/tasks', icon: ListChecks },
  { label: 'Submissions', href: '/admin/submissions', icon: Send },
  { label: 'Leaderboard', href: '/admin/leaderboard', icon: Trophy },
  { label: 'Posts', href: '/admin/posts', icon: Newspaper },
  { label: 'Reports', href: '/admin/reports', icon: FileBarChart },
];

function getNavItems(role: Role): NavItem[] {
  switch (role) {
    case 'admin': return adminNav;
    case 'judge': return judgeNav;
    default: return userNav;
  }
}

interface AppSidebarProps {
  role: Role;
  children: React.ReactNode;
}

export default function AppSidebar({ role, children }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: user } = useSession();
  const logout = useLogout();
  const activeRole = user?.role || role;
  const navItems = getNavItems(activeRole);

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/judge' || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const activeItem = navItems.find((item) => isActive(item.href));
  let pageTitle = activeItem ? activeItem.label : '';
  if (!pageTitle && pathname) {
    const segment = pathname.split('/').filter(Boolean)[0];
    if (segment) {
      pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-md bg-japan-red flex items-center justify-center">
          <span className="text-white font-serif font-bold text-sm">J</span>
        </div>
        {!collapsed && (
          <span className="font-serif font-semibold text-primary-text text-sm">Journey to Mastery</span>
        )}
      </div>

      <Separator />

      {/* Nav Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-japan-red/10 text-japan-red border-r-2 border-japan-red'
                    : 'text-secondary-text hover:bg-secondary-bg hover:text-primary-text',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Section */}
      {user && (
        <div className={cn('p-4', collapsed && 'flex flex-col items-center')}>
          <div className={cn('flex items-center gap-3 mb-3', collapsed && 'flex-col')}>
            <Avatar className="h-8 w-8">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback className="text-xs">
                {(user.fullName || user.username)?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary-text truncate">
                  {user.fullName || user.username}
                </p>
                <RankBadge rank={user.rank} size="sm" showIcon={false} />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            className="w-full text-muted-text hover:text-japan-red"
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Log out</span>}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-card-bg border-r border-borders sidebar-transition fixed h-full z-30',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card-bg border-r border-borders flex flex-col transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className={cn('flex-1 min-w-0 sidebar-transition', collapsed ? 'lg:ml-16' : 'lg:ml-64')}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-off-white/80 backdrop-blur-sm border-b border-borders">
          <div className="flex items-center justify-between px-4 lg:px-8 h-14">
            {/* Desktop Toggle & Title */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-md hover:bg-secondary-bg text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                aria-label="Toggle Sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-borders" />
              <span className="text-sm font-medium text-primary-text">{pageTitle}</span>
            </div>

            {/* Mobile Menu, Separator & Title */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 -ml-2 text-secondary-text hover:text-primary-text cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="h-4 w-px bg-borders" />
              <span className="text-sm font-medium text-primary-text">{pageTitle}</span>
            </div>

            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </header>

        <div className="px-4 lg:px-8 py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
