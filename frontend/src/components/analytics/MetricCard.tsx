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
  const accentGlow = {
    teal: 'from-teal-500/10 to-teal-900/5 border-teal-500/20 text-teal-400',
    purple: 'from-purple-500/10 to-purple-900/5 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/10 to-blue-900/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/10 to-amber-900/5 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/10 to-emerald-900/5 border-emerald-500/20 text-emerald-400',
  }[accentColor];

  const badgeStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    slate: 'bg-slate-800/60 text-slate-300 border-slate-700',
  }[badgeColor];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-md transition-all duration-200 hover:border-slate-700 ${accentGlow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 p-2 text-slate-300 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-slate-800" />
        ) : (
          <span className="font-mono text-2xl font-bold tracking-tight text-white">{value}</span>
        )}
        {badge && !isLoading && (
          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">
          {isLoading ? <span className="inline-block h-3 w-32 animate-pulse rounded bg-slate-800" /> : subtitle}
        </p>
      )}
    </div>
  );
};
