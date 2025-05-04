import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProfileCompletionProgressBarProps {
  percentage: number;
  className?: string;
}

/**
 * Komponen progress bar untuk menampilkan persentase kelengkapan profil
 */
export function ProfileCompletionProgressBar({ 
  percentage, 
  className 
}: ProfileCompletionProgressBarProps) {
  // Tentukan label berdasarkan persentase
  const getProgressLabel = () => {
    if (percentage < 25) {
      return "Mulai Lengkapi Profil";
    } else if (percentage < 50) {
      return "Sedang Berkembang";
    } else if (percentage < 75) {
      return "Hampir Lengkap";
    } else if (percentage < 100) {
      return "Sangat Baik";
    } else {
      return "Profil Lengkap";
    }
  };

  // Tentukan warna berdasarkan persentase
  const getProgressStyle = () => {
    if (percentage < 25) {
      return { indicator: "bg-red-500" };
    } else if (percentage < 50) {
      return { indicator: "bg-orange-500" };
    } else if (percentage < 75) {
      return { indicator: "bg-yellow-500" };
    } else if (percentage < 100) {
      return { indicator: "bg-blue-500" };
    } else {
      return { indicator: "bg-green-500" };
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Kelengkapan Profil</span>
          <span className={cn(
            "text-sm font-bold rounded-full px-2 py-1",
            percentage === 100 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
          )}>
            {percentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Progress bar */}
          <Progress 
            value={percentage} 
            className={cn("h-3", getProgressStyle().indicator)}
          />
          
          {/* Label di bawah progress bar */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{getProgressLabel()}</span>
            <span>
              {percentage < 100 ? (
                <span>Sisa {100 - percentage}% lagi untuk profil lengkap</span>
              ) : (
                <span className="text-green-600 font-medium">Profil Anda sudah lengkap!</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}