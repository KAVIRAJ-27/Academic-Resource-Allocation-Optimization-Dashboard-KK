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
    teal: 'bg-[#EEF6F1]/90 text-[#3F7655] border-[#C1DFCD]/80',
    purple: 'bg-[#F4F0E6]/90 text-[#202020] border-[#D8C9A8]/80',
    blue: 'bg-[#EFF4F8]/90 text-[#657C91] border-[#C6D5E2]/80',
    orange: 'bg-[#FAF4E8]/90 text-[#A87928] border-[#EED9B2]/80',
    rose: 'bg-[#FDF0F0]/90 text-[#B44747] border-[#ECC6C6]/80',
    emerald: 'bg-[#EEF6F1]/90 text-[#3F7655] border-[#C1DFCD]/80',
  };

  return (
    <Card hoverEffect className={cn('p-5 flex flex-col justify-between bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 shadow-glass rounded-2xl', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-serif font-bold text-[#555555] uppercase tracking-wider truncate">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl border shrink-0 backdrop-blur-xs shadow-xs', iconColors[iconColor])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-serif font-bold text-[#202020] tracking-tight">
            {value}
          </span>
          {badge ? (
            <div className="shrink-0">{badge}</div>
          ) : badgeText ? (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F8F6F0]/90 text-[#202020] border border-[#D8C9A8] shadow-xs">
              {badgeText}
            </span>
          ) : null}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
            {trend.direction === 'up' || trend.positive === true ? (
              <span className="text-[#3F7655] font-semibold inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {trend.value || trend.label}
              </span>
            ) : trend.direction === 'down' || trend.positive === false ? (
              <span className="text-[#B44747] font-semibold inline-flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {trend.value || trend.label}
              </span>
            ) : (
              <span className="text-[#555555] font-medium inline-flex items-center gap-0.5">
                <Minus className="w-3 h-3 text-[#77736A]" />
                {trend.value || trend.label || 'Nominal'}
              </span>
            )}
            {trend.value && <span className="text-[#77736A] font-medium">vs baseline</span>}
          </div>
        )}

        {description && (
          <p className="text-xs text-[#555555] font-normal mt-1.5 line-clamp-1">
            {description}
          </p>
        )}
      </div>

      {(action || footerText) && (
        <div className="mt-4 pt-3 border-t border-[#E8E0D0] flex items-center justify-between text-xs text-[#555555] font-normal">
          <span>{footerText || ''}</span>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </Card>
  );
};
