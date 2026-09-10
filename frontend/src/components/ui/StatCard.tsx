import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: LucideIcon;
  iconColor?: 'teal' | 'purple' | 'blue' | 'orange' | 'rose' | 'emerald';
  description?: string;
  trend?: {
    value?: string;
    positive?: boolean;
    direction?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  badgeText?: string;
  badge?: React.ReactNode;
  footerText?: string;
  className?: string;
  action?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value = '--',
  icon: Icon,
  iconColor = 'teal',
  description,
  trend,
  badgeText,
  badge,
  footerText,
  className,
  action,
}) => {
  const iconColors = {
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  };

  return (
    <Card className={cn('p-5 flex flex-col justify-between hoverEffect', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-2 rounded-xl border shrink-0', iconColors[iconColor])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {value}
          </span>
          {badge ? (
            <div className="shrink-0">{badge}</div>
          ) : badgeText ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
              {badgeText}
            </span>
          ) : null}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
            {trend.direction === 'up' || trend.positive === true ? (
              <span className="text-emerald-400 font-medium inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {trend.value || trend.label}
              </span>
            ) : trend.direction === 'down' || trend.positive === false ? (
              <span className="text-rose-400 font-medium inline-flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {trend.value || trend.label}
              </span>
            ) : (
              <span className="text-gray-400 font-medium inline-flex items-center gap-0.5">
                <Minus className="w-3 h-3 text-gray-500" />
                {trend.value || trend.label || 'Nominal'}
              </span>
            )}
            {trend.value && <span className="text-gray-500">vs baseline</span>}
          </div>
        )}

        {description && (
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {description}
          </p>
        )}
      </div>

      {(action || footerText) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>{footerText || ''}</span>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </Card>
  );
};
