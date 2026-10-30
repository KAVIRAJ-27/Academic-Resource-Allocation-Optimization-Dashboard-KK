import React from 'react';
import { Card } from '../ui/Card';
import { LucideIcon, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MetricPlaceholderCardProps {
  label: string;
  icon: LucideIcon;
  subtext?: string;
  className?: string;
}

export const MetricPlaceholderCard: React.FC<MetricPlaceholderCardProps> = ({
  label,
  icon: IconComponent,
  subtext = 'Telemetry Initializing',
  className,
}) => {
  return (
    <Card hoverEffect className={cn('relative flex items-center gap-4', className)}>
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-teal-400 shrink-0">
        <IconComponent className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 truncate">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-gray-200">Module Coming Soon</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
          <Clock className="w-3 h-3 text-teal-500/80" />
          <span>{subtext}</span>
        </div>
      </div>
    </Card>
  );
};
