import React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps {
  label?: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  label,
  orientation = 'horizontal',
  className,
}) => {
  if (orientation === 'vertical') {
    return <div className={cn('w-px h-full bg-[#1E2330]', className)} />;
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center justify-center my-4', className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1E2330]" />
        </div>
        <span className="relative px-3 text-[11px] font-mono text-gray-500 bg-[#11141C] uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  }

  return <hr className={cn('border-t border-[#1E2330] my-4', className)} />;
};
