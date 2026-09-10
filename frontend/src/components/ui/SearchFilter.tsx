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
      <Search className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[#171A23] border border-[#1E2330] rounded-xl pl-9 pr-8 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search"
          className="absolute right-2.5 p-0.5 text-gray-400 hover:text-white rounded transition-colors"
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
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
        isActive
          ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
          : 'bg-[#171A23] border-[#1E2330] text-gray-300 hover:text-white hover:border-[#2E3547]'
      } ${className}`}
    >
      <Filter className="w-3.5 h-3.5 text-gray-400" />
      <span>{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span className="w-4 h-4 rounded-full bg-teal-500 text-dark-bg text-[10px] font-bold flex items-center justify-center">
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
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
          selectedValues.length > 0
            ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
            : 'bg-[#171A23] border-[#1E2330] text-gray-300 hover:text-white hover:border-[#2E3547]'
        }`}
      >
        <span>{label}</span>
        {selectedValues.length > 0 && (
          <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[10px] font-mono">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-52 bg-[#11141C] border border-[#1E2330] rounded-xl shadow-dropdown z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-[#1E2330] mb-1">
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
                      ? 'bg-[#171A23] text-teal-300 font-medium'
                      : 'text-gray-300 hover:bg-[#171A23] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        isSelected
                          ? 'bg-teal-500 border-teal-500 text-dark-bg'
                          : 'border-gray-600 bg-[#0B0D14]'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{opt.label}</span>
                  </div>
                  {typeof opt.count === 'number' && (
                    <span className="text-[10px] text-gray-500 font-mono">
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedValues.length > 0 && (
            <div className="pt-1 border-t border-[#1E2330]">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-center py-1 text-[11px] text-gray-400 hover:text-teal-300 transition-colors"
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
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-[#171A23] border border-[#1E2330] text-gray-300 hover:text-white hover:border-[#2E3547] transition-colors ${className}`}
    >
      <Calendar className="w-3.5 h-3.5 text-gray-400" />
      <span className="text-gray-400">{label}:</span>
      <span className="font-mono text-gray-200">{dateRange}</span>
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
      className={`text-gray-400 hover:text-white ${className}`}
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
      className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-[#11141C] border border-[#1E2330] rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
};
