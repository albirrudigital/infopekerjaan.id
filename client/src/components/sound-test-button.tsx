import React from 'react';
import { Button } from '@/components/ui/button';
import { createSyntheticSound } from '@/lib/sounds';
import { Music } from 'lucide-react';

interface SoundTestButtonProps {
  soundType: 'unlock' | 'bronze' | 'silver' | 'gold' | 'platinum';
  label?: string;
  className?: string;
}

export default function SoundTestButton({ 
  soundType, 
  label, 
  className = '',
}: SoundTestButtonProps) {
  const levelColors = {
    unlock: 'bg-primary hover:bg-primary/90',
    bronze: 'bg-amber-600 hover:bg-amber-700',
    silver: 'bg-slate-400 hover:bg-slate-500',
    gold: 'bg-yellow-500 hover:bg-yellow-600',
    platinum: 'bg-indigo-600 hover:bg-indigo-700'
  };
  
  const handleClick = () => {
    createSyntheticSound(soundType);
  };
  
  return (
    <Button 
      onClick={handleClick} 
      variant="outline"
      className={`${levelColors[soundType]} text-white ${className}`}
    >
      <Music className="mr-2 h-4 w-4" />
      {label || `Test ${soundType.charAt(0).toUpperCase() + soundType.slice(1)}`}
    </Button>
  );
}