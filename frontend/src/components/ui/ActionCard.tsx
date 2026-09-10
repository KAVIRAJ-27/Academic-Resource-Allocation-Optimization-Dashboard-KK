import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { cn } from '../../utils/cn';
import { LucideIcon, ArrowRight } from 'lucide-react';

export interface ActionCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  onClick?: () => void;
  badge?: React.ReactNode | string;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  actionText = 'Explore Module',
  onAction,
  onClick,
  badge,
  className,
}) => {
  const handleClick = onClick || onAction;

  return (
    <Card
      className={cn('p-5 flex flex-col justify-between hoverEffect group cursor-pointer', className)}
      onClick={handleClick}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {badge && (
            typeof badge === 'string' ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-teal-300 border border-teal-500/20 uppercase tracking-wider">
                {badge}
              </span>
            ) : (
              <div className="shrink-0">{badge}</div>
            )
          )}
        </div>

        <h4 className="text-sm font-semibold text-gray-100 group-hover:text-teal-300 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick?.();
          }}
          className="w-full justify-between text-teal-400 hover:text-teal-300 px-0 hover:bg-transparent"
          iconRight={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        >
          <span>{actionText}</span>
        </Button>
      </div>
    </Card>
  );
};
