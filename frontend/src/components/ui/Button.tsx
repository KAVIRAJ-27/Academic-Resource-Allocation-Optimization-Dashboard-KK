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
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#B8A16A]/30 focus:ring-offset-2 focus:ring-offset-[#FFFEFA] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary:
      'bg-gradient-to-r from-[#C2AB75] via-[#B8A16A] to-[#A89158] hover:from-[#B8A16A] hover:to-[#967F47] text-[#202020] font-semibold shadow-xs hover:shadow-sm border border-[#A38C57]/70',
    secondary:
      'bg-white/80 backdrop-blur-sm hover:bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8]/80 shadow-xs hover:border-[#B8A16A]',
    outline:
      'bg-white/40 backdrop-blur-xs hover:bg-[#F4F0E6]/80 text-[#202020] border border-[#D8C9A8]',
    ghost:
      'bg-transparent hover:bg-[#F4F0E6]/70 text-[#555555] hover:text-[#202020]',
    danger:
      'bg-[#B44747] hover:bg-[#9B3C3C] text-white shadow-xs border border-transparent',
    success:
      'bg-[#3F7655] hover:bg-[#326044] text-white shadow-xs border border-transparent',
    link:
      'bg-transparent text-[#B8A16A] hover:text-[#8C7748] underline-offset-4 hover:underline p-0 h-auto font-medium',
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
