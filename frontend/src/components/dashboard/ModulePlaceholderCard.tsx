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
      className={cn('relative flex flex-col justify-between overflow-hidden group bg-white border border-[#D8C9A8] shadow-card', className)}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={domainBadgeVariant}>{domain}</Badge>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#77736A] bg-[#F8F6F0] px-2 py-0.5 rounded-full border border-[#E8E0D0]">
            <Clock className="w-3 h-3 text-[#B8A16A]" />
            {phase}
          </span>
        </div>

        <div className="flex items-start gap-3 mb-2">
          {IconComponent && (
            <div className="p-2 rounded-lg bg-[#F4F0E6] border border-[#D8C9A8] text-[#B8A16A] shrink-0 group-hover:border-[#B8A16A] transition-colors">
              <IconComponent className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-serif font-bold text-[#202020] group-hover:text-[#B8A16A] transition-colors">
              {title}
            </h3>
            <p className="text-xs text-[#555555] mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-[#E8E0D0] flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[#77736A] bg-[#F8F6F0] px-2 py-0.5 rounded border border-[#E8E0D0] font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B8A16A]">
          <Sparkles className="w-3 h-3" />
          Module Coming Soon
        </span>
      </div>
    </Card>
  );
};
