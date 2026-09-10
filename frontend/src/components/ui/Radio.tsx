import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, checked, disabled, onChange, ...props }, ref) => {
    const radioId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'inline-flex items-start gap-2.5 cursor-pointer select-none group',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-4 h-4 rounded-full border border-[#1E2330] bg-[#171A23] transition-all duration-150',
              'peer-checked:border-teal-500 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-500/50',
              'group-hover:border-gray-500'
            )}
          />
          <div
            className={cn(
              'w-2 h-2 rounded-full bg-teal-400 absolute transition-transform scale-0 duration-150 pointer-events-none',
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

Radio.displayName = 'Radio';
