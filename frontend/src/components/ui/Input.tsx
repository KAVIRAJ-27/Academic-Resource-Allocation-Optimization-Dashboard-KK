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
              className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
            >
              {label}
              {required && <span className="text-teal-400 ml-1 font-bold">*</span>}
            </label>
          </div>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-gray-500 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-[#171A23] border border-[#1E2330] rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500',
              'py-2 sm:py-2.5 transition-all duration-200 outline-none',
              'focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-[#1A1E29]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#11141C]',
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon || error ? 'pr-9' : 'pr-3.5',
              error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40 text-rose-200',
              className
            )}
            {...props}
          />

          {error ? (
            <div className="absolute right-3 text-rose-400 pointer-events-none flex items-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : rightIcon ? (
            <div className="absolute right-3 text-gray-500 flex items-center">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-gray-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
