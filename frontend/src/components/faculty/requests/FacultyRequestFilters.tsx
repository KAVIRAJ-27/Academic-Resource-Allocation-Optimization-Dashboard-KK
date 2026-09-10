import React from 'react';
import { Search, Calendar, RotateCcw } from 'lucide-react';
import { Button } from '../../ui';

interface FacultyRequestFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  onReset: () => void;
}

export const FacultyRequestFilters: React.FC<FacultyRequestFiltersProps> = ({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateChange,
  onReset,
}) => {
  const hasFilters = Boolean(searchTerm.trim() || dateFilter);

  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 shadow-card flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by purpose, resource name, or code..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#171A23] border border-[#1E2330] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Date filter */}
        <div className="relative sm:w-48">
          <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[#171A23] border border-[#1E2330] rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* Reset button */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </Button>
      )}
    </div>
  );
};
