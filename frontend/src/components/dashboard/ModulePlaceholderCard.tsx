import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModulePlaceholderCardProps {
  title: string;
  description: string;
  domain?: 'Academic' | 'Hostel' | 'Core';
  phase?: string;
  icon?: LucideIcon;
  tags?: string[];
  className?: string;
}

export const ModulePlaceholderCard: React.FC<ModulePlaceholderCardProps> = ({
  title,
  description,
  domain = 'Academic',
  phase = 'Phase 2',
  icon: IconComponent,
  tags = [],
  className,
}) => {
  const domainBadgeVariant = {
    Academic: 'teal',
    Hostel: 'orange',
    Core: 'purple',
  }[domain] as 'teal' | 'orange' | 'purple';

  return (
    <Card
      hoverEffect
      className={cn('relative flex flex-col justify-between overflow-hidden group', className)}
    >
      {/* Decorative subtle ambient hover glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-300 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={domainBadgeVariant}>{domain}</Badge>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-[#171A23] px-2 py-0.5 rounded-full border border-white/5">
            <Clock className="w-3 h-3 text-teal-400" />
            {phase}
          </span>
        </div>

        <div className="flex items-start gap-3 mb-2">
          {IconComponent && (
            <div className="p-2 rounded-lg bg-[#171A23] border border-[#1E2330] text-teal-400 shrink-0 group-hover:border-teal-500/40 group-hover:text-teal-300 transition-colors">
              <IconComponent className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">
              {title}
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-[#1E2330] flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-gray-400 bg-[#171A23] px-2 py-0.5 rounded border border-white/5 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400">
          <Sparkles className="w-3 h-3" />
          Module Coming Soon
        </span>
      </div>
    </Card>
  );
};
