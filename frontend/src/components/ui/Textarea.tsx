import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, required, disabled, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-teal-400 ml-1 font-bold">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full bg-[#171A23] border border-[#1E2330] rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500',
            'p-3 transition-all duration-200 outline-none resize-y min-h-[80px]',
            'focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-[#1A1E29]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#11141C]',
            error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40 text-rose-200',
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-[11px] text-rose-400 mt-1 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-gray-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
