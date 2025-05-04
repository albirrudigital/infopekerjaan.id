import React from 'react';
import { cn } from '@/lib/utils';

interface BrandmarkProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'default' | 'white';
}

const Brandmark: React.FC<BrandmarkProps> = ({
  className,
  width = 180,
  height = 40,
  variant = 'default'
}) => {
  return (
    <img 
      src="/images/logo.png" 
      alt="InfoPekerjaan.id Logo" 
      width={width} 
      height={height}
      className={cn(
        "object-contain", 
        variant === 'white' ? "brightness-0 invert" : "",
        className
      )}
    />
  );
};

export default Brandmark;