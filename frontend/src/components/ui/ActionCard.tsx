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
      hoverEffect
      className={cn('p-5 flex flex-col justify-between group cursor-pointer bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 shadow-glass rounded-2xl transition-all duration-200', className)}
      onClick={handleClick}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-[#F4F0E6]/90 text-[#B8A16A] border border-[#D8C9A8]/80 group-hover:bg-[#EED9B2]/60 transition-colors shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {badge && (
            typeof badge === 'string' ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F0E6]/90 text-[#202020] border border-[#D8C9A8]/80 uppercase tracking-wider font-semibold">
                {badge}
              </span>
            ) : (
              <div className="shrink-0">{badge}</div>
            )
          )}
        </div>

        <h4 className="text-sm font-serif font-bold text-[#202020] group-hover:text-[#B8A16A] transition-colors">
          {title}
        </h4>
        <p className="text-xs text-[#555555] mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E8E0D0]">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick?.();
          }}
          className="w-full justify-between text-[#B8A16A] hover:text-[#8C7748] px-0 hover:bg-transparent font-medium"
          iconRight={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        >
          <span>{actionText}</span>
        </Button>
      </div>
    </Card>
  );
};
