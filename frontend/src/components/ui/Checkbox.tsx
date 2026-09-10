import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, disabled, onChange, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex items-start gap-2.5 cursor-pointer select-none group',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-md border border-[#1E2330] bg-[#171A23] transition-all duration-150',
              'peer-checked:bg-teal-600 peer-checked:border-teal-500 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500/50',
              'group-hover:border-gray-500'
            )}
          />
          <Check
            className={cn(
              'w-3 h-3 text-white absolute transition-transform scale-0 duration-150 pointer-events-none',
              checked && 'scale-100'
            )}
          />
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-xs sm:text-sm text-gray-200 font-medium">{label}</span>}
            {description && <span className="text-[11px] text-gray-400 mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
