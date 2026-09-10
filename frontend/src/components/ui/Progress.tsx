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
    teal: 'bg-teal-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    amber: 'bg-amber-500',
    danger: 'bg-rose-500',
    rose: 'bg-rose-500',
  };

  const barColor = variants[activeKey] || 'bg-teal-500';

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono text-gray-300">{percentage}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('w-full bg-[#1E2330] rounded-full overflow-hidden', heights[size])}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
