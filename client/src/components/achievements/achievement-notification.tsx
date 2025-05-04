import React, { useState, useEffect } from 'react';
import { AchievementBadgeProps } from './achievement-badge';
import { Award, Trophy, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Level warna untuk pencapaian
const levelColors = {
  bronze: {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-800',
    icon: 'text-amber-600',
  },
  silver: {
    bg: 'bg-slate-200',
    border: 'border-slate-300',
    text: 'text-slate-800',
    icon: 'text-slate-600',
  },
  gold: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
  },
  platinum: {
    bg: 'bg-cyan-100',
    border: 'border-cyan-400',
    text: 'text-cyan-800',
    icon: 'text-cyan-600',
  },
};

interface AchievementNotificationProps {
  achievement: AchievementBadgeProps;
  onClose?: () => void;
}

export const AchievementToast = ({ 
  achievement, 
  onClose 
}: AchievementNotificationProps) => {
  const colors = levelColors[achievement.level];
  
  return (
    <div className={cn(
      "flex items-start p-4 rounded-lg shadow-md border",
      colors.bg,
      colors.border
    )}>
      <div className={cn("mr-4", colors.icon)}>
        {achievement.level === 'platinum' ? (
          <Trophy className="h-8 w-8" />
        ) : (
          <Award className="h-8 w-8" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className={cn("font-semibold", colors.text)}>Pencapaian Baru Terbuka!</h4>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="font-medium text-sm mb-0.5">{achievement.name}</p>
        <p className="text-xs text-gray-600 leading-tight">{achievement.description}</p>
      </div>
    </div>
  );
};

// Hook untuk memunculkan notifikasi achievement
export const useAchievementNotification = () => {
  const { toast } = useToast();
  
  const showAchievementNotification = (achievement: AchievementBadgeProps) => {
    toast({
      title: `Pencapaian Baru: ${achievement.name}`,
      description: achievement.description,
      action: (
        <div>
          <div className={cn(
            "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mr-2",
            levelColors[achievement.level].bg,
            levelColors[achievement.level].text,
          )}>
            {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
          </div>
        </div>
      ),
    });
  };
  
  return { showAchievementNotification };
};

// Komponen popup untuk mencapai achievement
interface AchievementPopupProps {
  achievement: AchievementBadgeProps;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementPopup = ({ 
  achievement, 
  isOpen, 
  onClose 
}: AchievementPopupProps) => {
  const colors = levelColors[achievement.level];
  
  // Tutup popup setelah 5 detik
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-10 duration-500">
      <div className={cn(
        "p-4 rounded-lg shadow-lg border",
        colors.bg,
        colors.border
      )}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn("font-bold text-lg flex items-center gap-2", colors.text)}>
            <Trophy className="h-5 w-5" />
            <span>Pencapaian Terbuka!</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center border-2",
            colors.bg,
            colors.border
          )}>
            <div className={cn("w-10 h-10", colors.icon)}>
              {achievement.level === 'platinum' ? (
                <Trophy className="w-full h-full" />
              ) : (
                <Award className="w-full h-full" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-1">{achievement.name}</h4>
            <p className="text-sm text-gray-600">{achievement.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className={cn(
                "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full",
                colors.bg,
                colors.text,
              )}>
                {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
              </div>
              <span className="text-xs text-gray-500">
                {new Date().toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onClose}
            className={cn(
              "px-3 py-1.5 rounded text-sm font-medium",
              "bg-gray-800 text-white hover:bg-gray-700"
            )}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};