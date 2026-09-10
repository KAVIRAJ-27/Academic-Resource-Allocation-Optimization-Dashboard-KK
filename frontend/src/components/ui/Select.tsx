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
            className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
          >
            {label}
            {required && <span className="text-teal-400 ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'w-full bg-[#171A23] border border-[#1E2330] rounded-xl pl-3.5 pr-10 py-2 sm:py-2.5',
              'text-xs sm:text-sm text-gray-100 outline-none transition-all duration-200 cursor-pointer appearance-none',
              'focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-[#1A1E29]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#11141C]',
              error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40 text-rose-200',
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
                    className="bg-[#11141C] text-gray-200 py-1"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3.5 text-gray-500 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-[11px] text-rose-400 font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-gray-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
