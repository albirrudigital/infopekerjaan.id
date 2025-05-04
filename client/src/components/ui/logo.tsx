import React from 'react';
import Brandmark from '@/components/ui/brandmark';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  className 
}) => {
  const dimensions = {
    sm: { width: 120, height: 32 },
    md: { width: 140, height: 36 },
    lg: { width: 160, height: 40 },
    xl: { width: 200, height: 50 }
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Brandmark 
        width={dimensions[size].width} 
        height={dimensions[size].height} 
        variant={variant} 
      />
    </div>
  );
};

export default Logo;