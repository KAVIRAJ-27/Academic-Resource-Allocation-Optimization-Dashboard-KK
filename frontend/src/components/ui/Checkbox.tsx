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
              'w-4 h-4 rounded-md border border-[#D9D2C3] bg-white transition-all duration-150',
              'peer-checked:bg-[#B8A16A] peer-checked:border-[#A38C57] peer-focus-visible:ring-2 peer-focus-visible:ring-[#B8A16A]/30',
              'group-hover:border-[#B8A16A]'
            )}
          />
          <Check
            className={cn(
              'w-3 h-3 text-[#202020] absolute transition-transform scale-0 duration-150 pointer-events-none stroke-[3]',
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

Checkbox.displayName = 'Checkbox';
