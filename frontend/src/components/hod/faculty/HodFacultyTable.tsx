import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodFacultySummary } from '../../../types/hod';
import {
  Users,
  Search,
  Eye,
  Edit2,
  ShieldCheck,
  BookOpen,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface HodFacultyTableProps {
  faculty: HodFacultySummary[];
  loading: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onViewDetails: (id: number) => void;
  onEdit: (faculty: HodFacultySummary) => void;
  onChangeStatus: (faculty: HodFacultySummary) => void;
}

export const HodFacultyTable: React.FC<HodFacultyTableProps> = ({
  faculty,
  loading,
  page,
  size,
  totalElements,
  totalPages,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onRefresh,
  onViewDetails,
  onEdit,
  onChangeStatus,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'INACTIVE':
        return <Badge variant="gray">INACTIVE</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger">SUSPENDED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      default:
        return <Badge variant="neutral">{status || 'UNKNOWN'}</Badge>;
    }
  };

  const getWorkloadBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OVERLOAD':
        return <Badge variant="orange">OVERLOAD</Badge>;
      case 'BALANCED':
        return <Badge variant="teal">BALANCED</Badge>;
      case 'UNDERLOAD':
        return <Badge variant="blue">UNDERLOAD</Badge>;
      default:
        return <Badge variant="neutral">PENDING</Badge>;
    }
  };

  return (
    <Card className="border border-gray-800 bg-gray-900/40 rounded-2xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Department Faculty Directory</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Faculty members affiliated with your department ({totalElements} total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, emp ID, email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={loading}
            className="border-gray-700/60 text-gray-300 hover:text-white"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60 text-slate-600 font-bold font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Faculty Member</th>
              <th className="py-3 px-4">Designation & Degree</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4 text-center">Courses</th>
              <th className="py-3 px-4 text-center">Workload</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-32 bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-800/60 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-24 bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-16 bg-gray-800/60 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-28 bg-gray-800 rounded" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-5 w-10 bg-gray-800 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-5 w-16 bg-gray-800 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-5 w-14 bg-gray-800 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-6 w-16 bg-gray-800 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : faculty.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-600 font-medium">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-600 opacity-60" />
                  <p className="font-semibold text-slate-700 font-medium text-sm">No faculty members found</p>
                  <p className="text-slate-500 font-medium mt-1 max-w-sm mx-auto">
                    {search || statusFilter !== 'ALL'
                      ? 'No department faculty matched the current search or status filter.'
                      : 'No faculty members are currently assigned to this department.'}
                  </p>
                </td>
              </tr>
            ) : (
              faculty.map((f) => (
                <tr key={f.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white">{f.fullName}</div>
                    <div className="text-[11px] text-slate-600 font-medium font-mono">{f.employeeId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">{f.designation || 'Faculty'}</div>
                    <div className="text-[11px] text-slate-600 font-medium">{f.qualification || '—'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium font-mono text-[11px]">
                    {f.email || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      <BookOpen className="w-3 h-3" />
                      {f.assignedSubjectsCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20 text-[11px]">
                        <Clock className="w-3 h-3" />
                        {f.totalWorkloadHours ? Number(f.totalWorkloadHours).toFixed(1) : '0.0'} hrs
                      </span>
                      {getWorkloadBadge(f.workloadStatus)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(f.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(f.id)}
                        className="text-slate-700 font-medium hover:text-white px-2 py-1 h-auto"
                        title="View Faculty Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(f)}
                        className="text-teal-400 hover:text-teal-300 px-2 py-1 h-auto"
                        title="Edit Information"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChangeStatus(f)}
                        className="text-amber-400 hover:text-amber-300 px-2 py-1 h-auto"
                        title="Change Status"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && faculty.length > 0 && (
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div>
            Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} faculty
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="border-gray-800 text-xs px-2.5 py-1"
            >
              Previous
            </Button>
            <span className="text-gray-300 font-medium">
              Page {page + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page + 1 >= totalPages}
              className="border-gray-800 text-xs px-2.5 py-1"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
