import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodResourceAllocationSummary } from '../../../types/hod';
import {
  Calendar,
  Clock,
  RefreshCw,
  Eye,
  Layers,
  User,
  ShieldAlert,
} from 'lucide-react';

interface HodAllocationTableProps {
  allocations: HodResourceAllocationSummary[];
  loading: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  statusFilter: string;
  fromDate: string;
  toDate: string;
  onStatusFilterChange: (val: string) => void;
  onFromDateChange: (val: string) => void;
  onToDateChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onViewDetails: (id: number) => void;
}

export const HodAllocationTable: React.FC<HodAllocationTableProps> = ({
  allocations,
  loading,
  page,
  size,
  totalElements,
  totalPages,
  statusFilter,
  fromDate,
  toDate,
  onStatusFilterChange,
  onFromDateChange,
  onToDateChange,
  onPageChange,
  onRefresh,
  onViewDetails,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'COMPLETED':
        return <Badge variant="info">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="gray">CANCELLED</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <Card className="border border-gray-800 bg-gray-900/50 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-bold">
              Department Resource Allocations
            </span>
            <span className="text-[11px] text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded-full">
              Read-Only Monitor
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter by Allocation Status"
              className="px-3 py-2 bg-gray-800/80 border border-gray-700/80 rounded-xl text-xs font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Date Filters */}
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/80 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-gray-400">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                aria-label="Filter Allocations From Date"
                className="bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/80 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-gray-400">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                aria-label="Filter Allocations To Date"
                className="bg-transparent text-xs text-white focus:outline-none"
              />
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-gray-700 hover:bg-gray-800 rounded-xl px-2.5 py-2"
              title="Refresh allocations"
            >
              <RefreshCw className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/30 text-[11px] uppercase tracking-wider font-semibold text-slate-600 font-bold">
              <th className="py-3.5 px-4">Alloc #</th>
              <th className="py-3.5 px-4">Resource</th>
              <th className="py-3.5 px-4">Allocated To</th>
              <th className="py-3.5 px-4">Time Window</th>
              <th className="py-3.5 px-4">Term & Slot</th>
              <th className="py-3.5 px-4">Purpose</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-sm">
            {loading && allocations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-600 font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                    <span>Loading department allocations...</span>
                  </div>
                </td>
              </tr>
            ) : allocations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Layers className="w-10 h-10 text-gray-600 mb-2" />
                    <p className="text-slate-700 font-medium font-medium">No resource allocations found</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {statusFilter !== 'ALL' || fromDate || toDate
                        ? 'Try modifying your filter parameters.'
                        : 'No active or historical resource allocations recorded for your department.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              allocations.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700 font-medium">
                    #{item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {item.resourceName}
                      </p>
                      <p className="text-xs font-mono text-slate-600 font-medium">{item.resourceCode}</p>
                      {item.categoryName && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.categoryName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs">
                        {item.allocatedToName ? item.allocatedToName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.allocatedToName || 'N/A'}</p>
                        <p className="text-xs text-slate-600 font-medium">{item.allocatedToEmail}</p>
                        {item.allocatedToRole && (
                          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-slate-700 font-medium border border-gray-700">
                            {item.allocatedToRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600 font-medium" />
                        <span>{new Date(item.startDatetime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-600 font-medium font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(item.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-xs">
                      {item.academicYearName && (
                        <p className="text-slate-700 font-medium font-medium">{item.academicYearName}</p>
                      )}
                      {item.semesterName && (
                        <p className="text-slate-600 font-medium text-[11px]">{item.semesterName}</p>
                      )}
                      {item.timeSlotName && (
                        <p className="text-blue-300 text-[11px]">{item.timeSlotName}</p>
                      )}
                      {!item.academicYearName && !item.timeSlotName && (
                        <span className="text-slate-500 font-medium italic text-[11px]">Ad-hoc Schedule</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-xs text-slate-700 font-medium line-clamp-2" title={item.purpose}>
                      {item.purpose || 'General usage'}
                    </p>
                    {item.requestId && (
                      <span className="inline-block mt-1 text-[10px] text-slate-600 font-medium bg-gray-800/80 px-1.5 py-0.5 rounded">
                        Req #{item.requestId}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(item.id)}
                      className="text-slate-600 font-medium hover:text-white hover:bg-gray-800 p-1.5 rounded-lg"
                      title="Inspect allocation"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div>
          Showing{' '}
          <strong className="text-white">
            {totalElements > 0 ? page * size + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong className="text-white">
            {Math.min((page + 1) * size, totalElements)}
          </strong>{' '}
          of <strong className="text-white">{totalElements}</strong> allocations
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => onPageChange(page - 1)}
            className="border-gray-800 hover:bg-gray-800 rounded-lg text-xs"
          >
            Previous
          </Button>
          <span className="px-2 text-gray-400">
            Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => onPageChange(page + 1)}
            className="border-gray-800 hover:bg-gray-800 rounded-lg text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};
