import React from 'react';
import { Search, Calendar, Filter, X, RefreshCw } from 'lucide-react';
import { Button } from '../../ui';
import { RequestStatus } from '../../../types/studentResourceRequest';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: RequestStatus | 'ALL';
  onStatusChange: (status: RequestStatus | 'ALL') => void;
  dateFilter: string;
  onDateChange: (date: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export const StudentRequestFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  onClearFilters,
  onRefresh,
  loading,
}) => {
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL' || dateFilter !== '';

  const statuses: { label: string; value: RequestStatus | 'ALL' }[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-3.5 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by purpose, resource name or code..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#171A23] border border-[#222838] rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as RequestStatus | 'ALL')}
              className="appearance-none bg-[#171A23] border border-[#222838] text-gray-200 text-xs font-medium rounded-lg px-3 py-2 pr-7 focus:outline-none focus:border-teal-500/50 transition-colors cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-[#171A23] border border-[#222838] text-gray-200 text-xs font-medium rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-500/50 transition-colors cursor-pointer"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => onDateChange('')}
                className="absolute -top-1.5 -right-1.5 bg-[#222838] rounded-full p-0.5 text-gray-400 hover:text-white"
                title="Clear date"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              leftIcon={<X className="w-3 h-3" />}
              className="text-xs text-gray-400 hover:text-white border-[#222838]"
            >
              Reset
            </Button>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3 h-3" />}
            className="text-xs text-gray-400 hover:text-white border-[#222838]"
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
