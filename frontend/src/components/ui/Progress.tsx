import React from 'react';
import { cn } from '../../utils/cn';

export type ProgressVariant =
  | 'teal'
  | 'purple'
  | 'blue'
  | 'orange'
  | 'emerald'
  | 'success'
  | 'warning'
  | 'danger'
  | 'amber'
  | 'rose';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: ProgressVariant;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  variant,
  color,
  size = 'md',
  className,
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const activeKey: ProgressVariant = (variant || color || 'teal') as ProgressVariant;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants: Record<ProgressVariant, string> = {
    teal: 'bg-[#B8A16A]',
    purple: 'bg-[#B8A16A]',
    blue: 'bg-[#657C91]',
    orange: 'bg-[#A87928]',
    emerald: 'bg-[#3F7655]',
    success: 'bg-[#3F7655]',
    warning: 'bg-[#A87928]',
    amber: 'bg-[#A87928]',
    danger: 'bg-[#B44747]',
    rose: 'bg-[#B44747]',
  };

  const barColor = variants[activeKey] || 'bg-[#B8A16A]';

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-[#555555]">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono text-[#202020] font-semibold">{percentage}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('w-full bg-[#F8F6F0] border border-[#E8E0D0] rounded-full overflow-hidden', heights[size])}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
