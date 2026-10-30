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
      container: 'bg-[#EEF6F1] text-[#3F7655] border-[#C1DFCD]',
      dot: 'bg-[#3F7655]',
    },
    purple: {
      container: 'bg-[#F4F0E6] text-[#202020] border-[#D8C9A8]',
      dot: 'bg-[#B8A16A]',
    },
    blue: {
      container: 'bg-[#EFF4F8] text-[#657C91] border-[#C6D5E2]',
      dot: 'bg-[#657C91]',
    },
    orange: {
      container: 'bg-[#FAF4E8] text-[#A87928] border-[#EED9B2]',
      dot: 'bg-[#A87928]',
    },
    gray: {
      container: 'bg-[#F8F6F0] text-[#555555] border-[#E8E0D0]',
      dot: 'bg-[#77736A]',
    },
    neutral: {
      container: 'bg-[#F8F6F0] text-[#555555] border-[#E8E0D0]',
      dot: 'bg-[#77736A]',
    },
    danger: {
      container: 'bg-[#FDF0F0] text-[#B44747] border-[#ECC6C6]',
      dot: 'bg-[#B44747]',
    },
    success: {
      container: 'bg-[#EEF6F1] text-[#3F7655] border-[#C1DFCD]',
      dot: 'bg-[#3F7655]',
    },
    warning: {
      container: 'bg-[#FAF4E8] text-[#A87928] border-[#EED9B2]',
      dot: 'bg-[#A87928]',
    },
    info: {
      container: 'bg-[#EFF4F8] text-[#657C91] border-[#C6D5E2]',
      dot: 'bg-[#657C91]',
    },
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold border tracking-wide uppercase select-none font-mono',
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
