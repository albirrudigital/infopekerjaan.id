import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AchievementBadge, AchievementBadgeProps } from './achievement-badge';

interface AchievementGroupProps {
  title: string;
  description: string;
  achievements: AchievementBadgeProps[];
  isLoading?: boolean;
}

export const AchievementGroup: React.FC<AchievementGroupProps> = ({
  title,
  description,
  achievements,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement, index) => (
              <AchievementBadge 
                key={`${achievement.type}-${achievement.level}-${index}`}
                {...achievement}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Belum ada pencapaian dalam kategori ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
};