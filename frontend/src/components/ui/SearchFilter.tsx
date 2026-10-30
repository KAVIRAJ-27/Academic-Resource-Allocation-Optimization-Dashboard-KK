import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Calendar, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { Button } from './Button';

// ----------------------------------------------------------------------
// 1. SearchInput
// ----------------------------------------------------------------------
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search records...',
  onClear,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center min-w-[220px] ${className}`}>
      <Search className="w-4 h-4 text-[#77736A] absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/80 backdrop-blur-sm border border-[#D8C9A8]/70 rounded-xl pl-9 pr-8 py-2 text-xs text-[#202020] placeholder-[#77736A] focus:outline-none focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 focus:bg-white/95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search"
          className="absolute right-2.5 p-0.5 text-[#77736A] hover:text-[#202020] rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. FilterButton
// ----------------------------------------------------------------------
export interface FilterButtonProps {
  label?: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  label = 'Filter',
  count,
  isActive = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-xs backdrop-blur-sm ${
        isActive
          ? 'bg-[#F4F0E6]/90 border-[#B8A16A] text-[#202020]'
          : 'bg-white/80 border-[#D8C9A8]/70 text-[#555555] hover:bg-[#F8F6F0] hover:text-[#202020]'
      } ${className}`}
    >
      <Filter className="w-3.5 h-3.5 text-[#77736A]" />
      <span>{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span className="w-4 h-4 rounded-full bg-[#B8A16A] text-[#202020] text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
};

// ----------------------------------------------------------------------
// 3. FilterDropdown
// ----------------------------------------------------------------------
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors shadow-xs ${
          selectedValues.length > 0
            ? 'bg-[#F4F0E6] border-[#D8C9A8] text-[#202020]'
            : 'bg-white border-[#D9D2C3] text-[#555555] hover:bg-[#F8F6F0] hover:text-[#202020]'
        }`}
      >
        <span>{label}</span>
        {selectedValues.length > 0 && (
          <span className="px-1.5 py-0.2 rounded bg-[#B8A16A] text-[#202020] text-[10px] font-mono font-bold">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-[#77736A]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-56 bg-white border border-[#D8C9A8] rounded-xl shadow-dropdown z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[11px] font-serif font-bold text-[#555555] uppercase tracking-wider border-b border-[#E8E0D0] mb-1">
            Filter by {label}
          </div>
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {options.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#F4F0E6] text-[#202020] font-medium'
                      : 'text-[#555555] hover:bg-[#F8F6F0]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#B8A16A] border-[#B8A16A] text-[#202020]'
                          : 'border-[#D9D2C3] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{opt.label}</span>
                  </div>
                  {typeof opt.count === 'number' && (
                    <span className="text-[10px] text-[#77736A] font-mono">
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedValues.length > 0 && (
            <div className="pt-1 border-t border-[#E8E0D0]">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-center py-1 text-[11px] text-[#77736A] hover:text-[#B8A16A] transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. DateRangePickerPlaceholder
// ----------------------------------------------------------------------
export interface DateRangePickerProps {
  label?: string;
  dateRange?: string;
  onClick?: () => void;
  className?: string;
}

export const DateRangePickerPlaceholder: React.FC<DateRangePickerProps> = ({
  label = 'Date Range',
  dateRange = 'Academic Term (Current)',
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-[#D9D2C3] text-[#555555] hover:bg-[#F8F6F0] transition-colors shadow-xs ${className}`}
    >
      <Calendar className="w-3.5 h-3.5 text-[#77736A]" />
      <span className="text-[#77736A]">{label}:</span>
      <span className="font-mono text-[#202020] font-semibold">{dateRange}</span>
    </button>
  );
};

// ----------------------------------------------------------------------
// 5. ResetFiltersButton
// ----------------------------------------------------------------------
export interface ResetFiltersButtonProps {
  onReset: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const ResetFiltersButton: React.FC<ResetFiltersButtonProps> = ({
  onReset,
  disabled = false,
  label = 'Reset Filters',
  className = '',
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReset}
      disabled={disabled}
      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
      className={`text-[#77736A] hover:text-[#202020] ${className}`}
    >
      {label}
    </Button>
  );
};

// ----------------------------------------------------------------------
// 6. FilterToolbar (Composite Container)
// ----------------------------------------------------------------------
export interface FilterToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#D8C9A8] rounded-xl shadow-card ${className}`}
    >
      {children}
    </div>
  );
};
