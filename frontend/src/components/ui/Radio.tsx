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
              'w-4 h-4 rounded-full border border-[#D9D2C3] bg-white transition-all duration-150',
              'peer-checked:border-[#B8A16A] peer-focus-visible:ring-2 peer-focus-visible:ring-[#B8A16A]/30',
              'group-hover:border-[#B8A16A]'
            )}
          />
          <div
            className={cn(
              'w-2 h-2 rounded-full bg-[#B8A16A] absolute transition-transform scale-0 duration-150 pointer-events-none',
              checked && 'scale-100'
            )}
          />
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-xs sm:text-sm text-[#202020] font-medium">{label}</span>}
            {description && <span className="text-[11px] text-[#555555] mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
