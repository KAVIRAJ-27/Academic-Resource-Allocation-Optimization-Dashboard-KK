import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../../../ui';
import { ComplaintStatus } from '../../../../types/studentHostelComplaint';

interface Props {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  statusFilter: ComplaintStatus | 'ALL';
  onStatusChange: (status: ComplaintStatus | 'ALL') => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}

export const HostelComplaintFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  onReset,
}) => {
  const hasActiveFilters =
    searchTerm.trim() !== '' || statusFilter !== 'ALL' || categoryFilter !== 'ALL';

  return (
    <div className="p-4 bg-[#11141C] border border-[#1E2330] rounded-xl space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search complaints by title or issue..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0C0E14] border border-[#1E2330] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0C0E14] border border-[#1E2330] px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as ComplaintStatus | 'ALL')}
              className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#11141C] text-gray-200">
                All Statuses
              </option>
              <option value="OPEN" className="bg-[#11141C] text-amber-400">
                Open
              </option>
              <option value="IN_PROGRESS" className="bg-[#11141C] text-blue-400">
                In Progress
              </option>
              <option value="RESOLVED" className="bg-[#11141C] text-emerald-400">
                Resolved
              </option>
              <option value="CLOSED" className="bg-[#11141C] text-gray-400">
                Closed
              </option>
              <option value="REJECTED" className="bg-[#11141C] text-rose-400">
                Rejected
              </option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0C0E14] border border-[#1E2330] px-3 py-1.5 rounded-lg">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#11141C] text-gray-200">
                All Categories
              </option>
              <option value="ROOM" className="bg-[#11141C] text-purple-300">
                Room / Furniture
              </option>
              <option value="ELECTRICAL" className="bg-[#11141C] text-amber-300">
                Electrical
              </option>
              <option value="PLUMBING" className="bg-[#11141C] text-cyan-300">
                Plumbing
              </option>
              <option value="CLEANLINESS" className="bg-[#11141C] text-teal-300">
                Cleanliness
              </option>
              <option value="INTERNET" className="bg-[#11141C] text-indigo-300">
                Wi-Fi / Internet
              </option>
              <option value="SECURITY" className="bg-[#11141C] text-rose-300">
                Security
              </option>
              <option value="OTHER" className="bg-[#11141C] text-gray-300">
                Other
              </option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="border-[#222838] text-gray-400 hover:text-gray-200"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
