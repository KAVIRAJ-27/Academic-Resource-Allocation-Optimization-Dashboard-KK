import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'rose' | 'amber' | 'teal' | 'indigo' | 'slate';
  accentColor?: 'teal' | 'purple' | 'blue' | 'amber' | 'emerald';
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'teal',
  accentColor = 'teal',
  isLoading = false,
}) => {
  const iconColors = {
    teal: 'bg-[#EEF6F1] text-[#3F7655] border-[#C1DFCD]',
    purple: 'bg-[#F4F0E6] text-[#202020] border-[#D8C9A8]',
    blue: 'bg-[#EFF4F8] text-[#657C91] border-[#C6D5E2]',
    amber: 'bg-[#FAF4E8] text-[#A87928] border-[#EED9B2]',
    emerald: 'bg-[#EEF6F1] text-[#3F7655] border-[#C1DFCD]',
  }[accentColor];

  const badgeStyles = {
    emerald: 'bg-[#EEF6F1] text-[#3F7655] border-[#C1DFCD]',
    rose: 'bg-[#FDF0F0] text-[#B44747] border-[#ECC6C6]',
    amber: 'bg-[#FAF4E8] text-[#A87928] border-[#EED9B2]',
    teal: 'bg-[#EEF6F1] text-[#3F7655] border-[#C1DFCD]',
    indigo: 'bg-[#F4F0E6] text-[#202020] border-[#D8C9A8]',
    slate: 'bg-[#F8F6F0] text-[#555555] border-[#E8E0D0]',
  }[badgeColor];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#D8C9A8] bg-white p-5 shadow-card transition-all duration-200 hover:border-[#B8A16A] hover:shadow-card-hover"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-serif font-bold text-[#555555] uppercase tracking-wider">{title}</span>
        <div className={`rounded-xl border p-2 shadow-xs ${iconColors}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-[#F4F0E6]" />
        ) : (
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#202020]">{value}</span>
        )}
        {badge && !isLoading && (
          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase font-mono ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-[#555555] font-normal">
          {isLoading ? <span className="inline-block h-3 w-32 animate-pulse rounded bg-[#F4F0E6]" /> : subtitle}
        </p>
      )}
    </div>
  );
};
