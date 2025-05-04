import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';
import { AchievementBadgeProps } from './achievement-badge';
import { Trophy, Award, Medal, Star, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { playAchievementSound, createSyntheticSound } from '@/lib/sounds';

// Level warna untuk pencapaian
const levelColors = {
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-500',
    confetti: ['#f59e0b', '#b45309', '#fbbf24', '#fcd34d']
  },
  silver: {
    bg: 'bg-slate-100 dark:bg-slate-950/30',
    border: 'border-slate-300 dark:border-slate-800',
    text: 'text-slate-800 dark:text-slate-300',
    icon: 'text-slate-600 dark:text-slate-500',
    confetti: ['#94a3b8', '#64748b', '#cbd5e1', '#e2e8f0']
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-950/30',
    border: 'border-yellow-400 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: 'text-yellow-600 dark:text-yellow-500',
    confetti: ['#eab308', '#ca8a04', '#facc15', '#fde047']
  },
  platinum: {
    bg: 'bg-indigo-100 dark:bg-indigo-950/30',
    border: 'border-indigo-400 dark:border-indigo-800',
    text: 'text-indigo-800 dark:text-indigo-300',
    icon: 'text-indigo-600 dark:text-indigo-500',
    confetti: ['#6366f1', '#4f46e5', '#a5b4fc', '#818cf8']
  },
};

interface AchievementAnimationProps {
  achievement: AchievementBadgeProps | null;
  isOpen: boolean;
  onClose: () => void;
}

// Menampilkan ikon yang sesuai dengan level achievement
const LevelIcon = ({ level }: { level: string }) => {
  switch (level) {
    case 'platinum':
      return <Trophy className="h-12 w-12" />;
    case 'gold':
      return <Medal className="h-12 w-12" />;
    case 'silver':
      return <Medal className="h-12 w-12" />;
    case 'bronze':
      return <Award className="h-12 w-12" />;
    default:
      return <Star className="h-12 w-12" />;
  }
};

export const AchievementAnimation: React.FC<AchievementAnimationProps> = ({ 
  achievement, 
  isOpen, 
  onClose 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  
  // Menampilkan konfeti dan memainkan suara saat achievement di-unlock
  useEffect(() => {
    if (isOpen && achievement) {
      // Tampilkan konfeti
      setShowConfetti(true);
      
      // Putar suara berdasarkan level achievement
      try {
        // Coba memutar suara yang tersimpan di server
        playAchievementSound(achievement.level);
      } catch (error) {
        // Sebagai fallback, buat suara sintetis
        createSyntheticSound(achievement.level as 'unlock' | 'bronze' | 'silver' | 'gold' | 'platinum');
      }
      
      // Atur timer untuk menghentikan konfeti
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // Konfeti akan berhenti setelah 5 detik
      
      return () => {
        clearTimeout(timer);
        setShowConfetti(false);
      };
    }
  }, [isOpen, achievement]);
  
  if (!achievement) return null;
  
  const colors = levelColors[achievement.level];
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.15}
          colors={colors.confetti}
        />
      )}
      
      <DialogContent className={cn(
        "border-2 max-w-md overflow-hidden",
        colors.border,
        colors.bg
      )}>
        <DialogHeader>
          <DialogTitle className={cn("text-center text-2xl font-bold", colors.text)}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex justify-center items-center mb-4"
            >
              <span className={cn("inline-block p-4 rounded-full border-2", colors.border, colors.bg)}>
                <span className={colors.icon}>
                  <LevelIcon level={achievement.level} />
                </span>
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Pencapaian Terbuka!
            </motion.div>
          </DialogTitle>
          
          <DialogDescription className="text-center pt-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-semibold text-lg mb-1"
            >
              {achievement.name}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-muted-foreground"
            >
              {achievement.description}
            </motion.div>
          </DialogDescription>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center my-4"
        >
          <div className={cn(
            "inline-flex items-center px-3 py-1 rounded-full font-medium",
            colors.bg,
            colors.text,
            colors.border
          )}>
            {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
          </div>
        </motion.div>
        
        <DialogFooter className="flex justify-center sm:justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Button onClick={onClose} className="w-full">
              Lanjutkan
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};