import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  iconOnly = false,
  iconLeft,
  iconRight,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  const isButtonLoading = isLoading || loading;
  const startIcon = leftIcon || iconLeft;
  const endIcon = rightIcon || iconRight;

  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-[#080A0F] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary:
      'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-900/30 border border-teal-500/30',
    secondary:
      'bg-[#171A23] hover:bg-[#222838] text-gray-200 border border-[#1E2330] hover:border-gray-600',
    outline:
      'bg-transparent hover:bg-white/[0.04] text-gray-300 border border-[#1E2330] hover:text-white hover:border-gray-500',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-gray-400 hover:text-white',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-500/30 shadow-md shadow-rose-950/30',
    success:
      'bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-500/30 shadow-md shadow-emerald-950/30',
    link:
      'bg-transparent text-teal-400 hover:text-teal-300 underline-offset-4 hover:underline p-0 h-auto',
  };

  const sizes = {
    xs: iconOnly ? 'p-1.5 text-xs' : 'px-2.5 py-1 text-xs gap-1.5',
    sm: iconOnly ? 'p-2 text-xs' : 'px-3 py-1.5 text-xs gap-2',
    md: iconOnly ? 'p-2.5 text-sm' : 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: iconOnly ? 'p-3 text-base' : 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        variant !== 'link' && sizes[size],
        className
      )}
      disabled={disabled || isButtonLoading}
      {...props}
    >
      {isButtonLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {startIcon && <span className="inline-flex shrink-0">{startIcon}</span>}
          {children}
          {endIcon && <span className="inline-flex shrink-0">{endIcon}</span>}
        </>
      )}
    </button>
  );
};
