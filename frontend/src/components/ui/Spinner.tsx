import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'teal' | 'white' | 'gray';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'teal',
  className,
  label,
}) => {
  const sizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variants = {
    teal: 'text-teal-400',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <Loader2 className={cn('animate-spin shrink-0', sizes[size], variants[variant])} />
      {label && <span className="text-xs text-gray-400 font-mono">{label}</span>}
    </div>
  );
};
