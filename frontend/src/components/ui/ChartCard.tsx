import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './Card';
import { cn } from '../../utils/cn';
import { BarChart3, Loader2, LucideIcon } from 'lucide-react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string;
  headerAction?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  icon: Icon = BarChart3,
  isLoading = false,
  isEmpty = true,
  emptyTitle = 'No chart telemetry available',
  emptyDescription,
  emptyMessage = 'Telemetry awaiting data pipeline activation in Phase 5',
  headerAction,
  footerContent,
  className,
  children,
}) => {
  const displayEmptyDescription = emptyDescription || emptyMessage;

  return (
    <Card className={cn('p-5 flex flex-col justify-between', className)}>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <CardTitle className="text-sm font-semibold text-gray-200">{title}</CardTitle>
            {subtitle && <CardDescription className="text-[11px] mt-0.5">{subtitle}</CardDescription>}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </CardHeader>

      <div className="relative min-h-[200px] sm:min-h-[240px] flex items-center justify-center pt-2">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
            <span className="text-xs font-mono">Synthesizing chart data...</span>
          </div>
        ) : isEmpty || !children ? (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#1E2330] rounded-xl w-full h-full my-auto bg-[#171A23]/30">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-500 mb-2">
              <Icon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-medium text-gray-400">{emptyTitle}</p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xs">{displayEmptyDescription}</p>
          </div>
        ) : (
          <div className="w-full h-full min-h-[200px]">{children}</div>
        )}
      </div>

      {footerContent && (
        <div className="pt-3 border-t border-white/5 mt-3 text-xs text-gray-400">
          {footerContent}
        </div>
      )}
    </Card>
  );
};
