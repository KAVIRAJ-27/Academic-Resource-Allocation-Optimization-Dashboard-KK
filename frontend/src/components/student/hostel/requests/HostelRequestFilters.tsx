import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../../../ui';
import { RequestStatus } from '../../../../types/studentResourceRequest';

interface Props {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  statusFilter: RequestStatus | 'ALL';
  onStatusChange: (status: RequestStatus | 'ALL') => void;
  requestTypeFilter: string;
  onRequestTypeChange: (type: string) => void;
  onReset: () => void;
}

export const HostelRequestFilters: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  requestTypeFilter,
  onRequestTypeChange,
  onReset,
}) => {
  const hasActiveFilters =
    searchTerm.trim() !== '' || statusFilter !== 'ALL' || requestTypeFilter !== 'ALL';

  return (
    <div className="p-4 bg-[#11141C] border border-[#1E2330] rounded-xl space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by description or type..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0C0E14] border border-[#1E2330] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
          />
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0C0E14] border border-[#1E2330] px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as RequestStatus | 'ALL')}
              className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#11141C] text-gray-200">
                All Statuses
              </option>
              <option value="PENDING" className="bg-[#11141C] text-amber-400">
                Pending Review
              </option>
              <option value="APPROVED" className="bg-[#11141C] text-emerald-400">
                Approved
              </option>
              <option value="REJECTED" className="bg-[#11141C] text-rose-400">
                Rejected
              </option>
              <option value="CANCELLED" className="bg-[#11141C] text-gray-400">
                Cancelled
              </option>
              <option value="COMPLETED" className="bg-[#11141C] text-teal-400">
                Completed
              </option>
            </select>
          </div>

          {/* Request Type Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0C0E14] border border-[#1E2330] px-3 py-1.5 rounded-lg">
            <select
              value={requestTypeFilter}
              onChange={(e) => onRequestTypeChange(e.target.value)}
              className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#11141C] text-gray-200">
                All Request Types
              </option>
              <option value="ROOM_CHANGE" className="bg-[#11141C] text-purple-300">
                Room Change
              </option>
              <option value="MAINTENANCE" className="bg-[#11141C] text-amber-300">
                Maintenance
              </option>
              <option value="FACILITY" className="bg-[#11141C] text-teal-300">
                Facility
              </option>
              <option value="GENERAL" className="bg-[#11141C] text-blue-300">
                General
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
