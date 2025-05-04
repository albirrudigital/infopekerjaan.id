import React from 'react';
import { 
  Award, Trophy, Medal, Crown, Star, Target, 
  FileCheck, Calendar, Briefcase, Users, Clock, 
  ShieldCheck, CheckCheck, Rocket, LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AchievementLevel } from '@/hooks/use-achievements';

export interface AchievementBadgeProps {
  name: string;
  type: string;
  description: string;
  level: AchievementLevel;
  icon?: string;
  unlocked: boolean;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface AchievementIconProps {
  icon: string;
  className?: string;
}

export function getAchievementIcon(icon: string) {
  const iconMap: Record<string, LucideIcon> = {
    award: Award,
    trophy: Trophy,
    medal: Medal,
    crown: Crown,
    star: Star,
    target: Target,
    fileCheck: FileCheck,
    calendar: Calendar,
    briefcase: Briefcase,
    users: Users,
    clock: Clock,
    shieldCheck: ShieldCheck,
    checkCheck: CheckCheck,
    rocket: Rocket
  };

  const IconComponent = iconMap[icon] || Award;
  
  return <IconComponent className="h-4 w-4" />;
}

export const AchievementIcon: React.FC<AchievementIconProps> = ({ 
  icon,
  className
}) => {
  return (
    <span className={cn("inline-flex", className)}>
      {getAchievementIcon(icon)}
    </span>
  );
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  name,
  type,
  level,
  description,
  icon = "award",
  unlocked,
  unlockedAt,
  size = "md"
}) => {
  // Define styles based on level
  const levelStyles: Record<AchievementLevel, { bg: string, text: string, border: string }> = {
    bronze: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800'
    },
    silver: {
      bg: 'bg-slate-50 dark:bg-slate-950/30',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-800'
    },
    gold: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    platinum: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      text: 'text-indigo-800 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800'
    }
  };

  // Styles for each size
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  };

  const currentStyles = levelStyles[level];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-md font-medium transition-all",
        currentStyles.bg,
        currentStyles.text,
        currentStyles.border,
        sizeStyles[size],
        !unlocked && "opacity-40 grayscale"
      )}
    >
      <AchievementIcon icon={icon} />
      <span>{name}</span>
    </Badge>
  );
};