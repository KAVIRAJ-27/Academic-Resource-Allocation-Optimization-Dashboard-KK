import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodResourceRequestSummary } from '../../../types/hod';
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface HodRequestTableProps {
  requests: HodResourceRequestSummary[];
  loading: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  priorityFilter: string;
  fromDate: string;
  toDate: string;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
  onPriorityFilterChange: (val: string) => void;
  onFromDateChange: (val: string) => void;
  onToDateChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onViewDetails: (id: number) => void;
  onApprove: (request: HodResourceRequestSummary) => void;
  onReject: (request: HodResourceRequestSummary) => void;
}

export const HodRequestTable: React.FC<HodRequestTableProps> = ({
  requests,
  loading,
  page,
  size,
  totalElements,
  totalPages,
  search,
  statusFilter,
  priorityFilter,
  fromDate,
  toDate,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onFromDateChange,
  onToDateChange,
  onPageChange,
  onRefresh,
  onViewDetails,
  onApprove,
  onReject,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'CANCELLED':
        return <Badge variant="gray">CANCELLED</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-gray-700/50 text-gray-300 border border-gray-600/30">LOW</span>;
      default:
        return <span className="text-xs text-gray-400">{priority}</span>;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '--';
    return time.length > 5 ? time.substring(0, 5) : time;
  };

  return (
    <Card className="border border-gray-800 bg-gray-900/50 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header Controls */}
      <div className="p-4 border-b border-gray-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by requester, resource, code, or purpose..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-800/80 border border-gray-700/80 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Filter by Request Status"
              className="px-3 py-2 bg-gray-800/80 border border-gray-700/80 rounded-xl text-xs font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              aria-label="Filter by Request Priority"
              className="px-3 py-2 bg-gray-800/80 border border-gray-700/80 rounded-xl text-xs font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Date Filters */}
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/80 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-gray-400">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                aria-label="Filter From Date"
                className="bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/80 border border-gray-700/80 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-gray-400">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                aria-label="Filter To Date"
                className="bg-transparent text-xs text-white focus:outline-none"
              />
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-gray-700 hover:bg-gray-800 rounded-xl px-2.5 py-2"
              title="Refresh requests"
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
            <tr className="border-b border-gray-800 bg-gray-800/30 text-[11px] uppercase tracking-wider font-semibold text-gray-400">
              <th className="py-3.5 px-4">Req #</th>
              <th className="py-3.5 px-4">Requester</th>
              <th className="py-3.5 px-4">Resource Requested</th>
              <th className="py-3.5 px-4">Date & Schedule</th>
              <th className="py-3.5 px-4">Purpose</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-sm">
            {loading && requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                    <span>Loading department requests...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Layers className="w-10 h-10 text-gray-600 mb-2" />
                    <p className="text-gray-300 font-medium">No resource requests found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || fromDate || toDate
                        ? 'Try clearing or modifying your search and filter criteria.'
                        : 'No resource requests have been submitted by department faculty or students.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-300">
                    #{item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                        {item.requesterName ? item.requesterName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {item.requesterName || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-400">{item.requesterEmail}</p>
                        {item.requesterRole && (
                          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 border border-gray-700">
                            {item.requesterRole}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.requestedResourceName || 'Specific Resource Not Specified'}
                      </p>
                      {item.requestedResourceCode && (
                        <p className="text-xs font-mono text-gray-400">
                          {item.requestedResourceCode}
                        </p>
                      )}
                      {item.categoryName && (
                        <span className="text-[11px] text-gray-400">
                          Category: <strong className="text-gray-300">{item.categoryName}</strong>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-xs text-gray-300">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.requestedDate}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-xs text-gray-300 line-clamp-2" title={item.purpose}>
                      {item.purpose || 'No purpose stated'}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    {getPriorityBadge(item.priority)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(item.id)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800 p-1.5 rounded-lg"
                        title="View request details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {item.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onApprove(item)}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-1.5 rounded-lg"
                            title="Approve request"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReject(item)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 rounded-lg"
                            title="Reject request"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
          of <strong className="text-white">{totalElements}</strong> requests
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
