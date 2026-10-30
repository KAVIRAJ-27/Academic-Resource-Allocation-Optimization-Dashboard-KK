import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, required, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-[#202020] uppercase tracking-wider font-mono"
            >
              {label}
              {required && <span className="text-[#B44747] ml-1 font-bold">*</span>}
            </label>
          </div>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#77736A] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-white/80 backdrop-blur-sm border border-[#D8C9A8]/70 rounded-xl text-xs sm:text-sm text-[#202020] placeholder-[#77736A]',
              'py-2 sm:py-2.5 transition-all duration-200 outline-none shadow-xs',
              'focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 focus:bg-white/95',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#F8F6F0]/70',
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon || error ? 'pr-9' : 'pr-3.5',
              error && 'border-[#B44747] focus:border-[#B44747] focus:ring-[#B44747]/20 text-[#B44747]',
              className
            )}
            {...props}
          />

          {error ? (
            <div className="absolute right-3 text-[#B44747] pointer-events-none flex items-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : rightIcon ? (
            <div className="absolute right-3 text-[#77736A] flex items-center">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-[11px] text-[#B44747] flex items-center gap-1 mt-1 font-medium">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[#77736A] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
