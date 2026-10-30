import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, required, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#202020] uppercase tracking-wider font-mono"
          >
            {label}
            {required && <span className="text-[#B8A16A] ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full bg-white/80 backdrop-blur-sm border border-[#D8C9A8]/70 rounded-xl pl-3.5 pr-10 py-2 sm:py-2.5',
              'text-xs sm:text-sm text-[#202020] outline-none transition-all duration-200 cursor-pointer appearance-none shadow-xs',
              'focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 focus:bg-white/95',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F8F6F0]/70',
              error && 'border-[#B44747] focus:border-[#B44747] focus:ring-[#B44747]/20 text-[#B44747]',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-white text-[#202020] py-1"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 text-[#77736A] pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-[11px] text-[#B44747] font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#77736A] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
