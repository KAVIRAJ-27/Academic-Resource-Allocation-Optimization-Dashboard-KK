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
    <Card className={cn('p-5 flex flex-col justify-between bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 shadow-glass rounded-2xl', className)}>
      <CardHeader className="flex-row items-center justify-between pb-3 border-b border-[#E8E0D0]/80">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-[#F4F0E6]/90 text-[#B8A16A] border border-[#D8C9A8]/80 shrink-0 backdrop-blur-xs shadow-xs">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <CardTitle className="text-sm font-serif font-bold text-[#202020]">{title}</CardTitle>
            {subtitle && <CardDescription className="text-xs text-[#555555] mt-0.5">{subtitle}</CardDescription>}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </CardHeader>

      <div className="relative min-h-[200px] sm:min-h-[240px] flex items-center justify-center pt-2">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-[#77736A]">
            <Loader2 className="w-6 h-6 animate-spin text-[#B8A16A]" />
            <span className="text-xs font-mono">Synthesizing chart telemetry...</span>
          </div>
        ) : isEmpty || !children ? (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#D8C9A8]/80 rounded-2xl w-full h-full my-auto bg-[#F8F6F0]/40 backdrop-blur-xs">
            <div className="p-3 rounded-xl bg-white/90 border border-[#D8C9A8] text-[#B8A16A] mb-2 shadow-xs">
              <Icon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-serif font-bold text-[#202020]">{emptyTitle}</p>
            <p className="text-[11px] text-[#555555] mt-1 max-w-xs">{displayEmptyDescription}</p>
          </div>
        ) : (
          <div className="w-full h-full min-h-[200px]">{children}</div>
        )}
      </div>

      {footerContent && (
        <div className="pt-3 border-t border-[#E8E0D0]/80 mt-3 text-xs text-[#77736A]">
          {footerContent}
        </div>
      )}
    </Card>
  );
};
