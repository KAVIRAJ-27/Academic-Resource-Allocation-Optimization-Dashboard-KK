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
            className="block text-xs font-semibold text-[#202020] uppercase tracking-wider font-mono"
          >
            {label}
            {required && <span className="text-[#B8A16A] ml-1 font-bold">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full bg-white border border-[#D9D2C3] rounded-xl text-xs sm:text-sm text-[#202020] placeholder-[#77736A]',
            'p-3 transition-all duration-200 outline-none resize-y min-h-[80px] shadow-xs',
            'focus:border-[#B8A16A] focus:ring-1 focus:ring-[#B8A16A] focus:bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F8F6F0]',
            error && 'border-[#B44747] focus:border-[#B44747] focus:ring-[#B44747]/20 text-[#B44747]',
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-[11px] text-[#B44747] mt-1 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#77736A] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
