import React, { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'teal'
  | 'purple'
  | 'blue'
  | 'orange'
  | 'gray'
  | 'neutral'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

// Maps semantic AHRAO domain statuses directly to standardized variants
export const getStatusBadgeVariant = (status: string): BadgeVariant => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'AVAILABLE':
    case 'COMPLETED':
      return 'success';

    case 'PENDING':
    case 'MAINTENANCE':
    case 'RESERVED':
      return 'warning';

    case 'REJECTED':
    case 'CANCELLED':
    case 'SUSPENDED':
      return 'danger';

    case 'ALLOCATED':
    case 'OCCUPIED':
      return 'teal';

    case 'IN_PROGRESS':
    case 'ASSIGNED':
      return 'blue';

    case 'INACTIVE':
    case 'CLOSED':
    default:
      return 'gray';
  }
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  status,
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const activeVariant: BadgeVariant = variant || (status ? getStatusBadgeVariant(status) : 'teal');

  const variants: Record<BadgeVariant, { container: string; dot: string }> = {
    teal: {
      container: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      dot: 'bg-teal-400',
    },
    purple: {
      container: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      dot: 'bg-purple-400',
    },
    blue: {
      container: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      dot: 'bg-blue-400',
    },
    orange: {
      container: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      dot: 'bg-orange-400',
    },
    gray: {
      container: 'bg-gray-800/60 text-gray-300 border-gray-700/50',
      dot: 'bg-gray-400',
    },
    neutral: {
      container: 'bg-gray-800/60 text-gray-300 border-gray-700/50',
      dot: 'bg-gray-400',
    },
    danger: {
      container: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
    },
    success: {
      container: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    warning: {
      container: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    info: {
      container: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      dot: 'bg-sky-400',
    },
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border tracking-wide uppercase select-none font-mono',
        variants[activeVariant].container,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', variants[activeVariant].dot)} />}
      {children || status}
    </span>
  );
};
