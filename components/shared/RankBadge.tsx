import { cn } from '@/lib/utils';
import type { Rank } from '@/types/api.types';
import { Shield, Swords, Crown, Flame, Users } from 'lucide-react';

const rankConfig: Record<Rank, { icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string; glow?: string }> = {
  Ronin: {
    icon: Shield,
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-300',
  },
  Kenshi: {
    icon: Swords,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
  Samurai: {
    icon: Flame,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  Shogun: {
    icon: Crown,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
  },
  Team: {
    icon: Users,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
};

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function RankBadge({ rank, size = 'md', showIcon = true, className }: RankBadgeProps) {
  const config = rankConfig[rank] || {
    icon: Shield,
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-300',
    glow: '',
  };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium transition-all duration-200',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        config.glow,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {rank}
    </span>
  );
}
