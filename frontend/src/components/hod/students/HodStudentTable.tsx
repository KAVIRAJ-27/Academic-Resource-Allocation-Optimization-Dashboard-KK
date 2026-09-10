import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodStudentSummary, HodStudentReferenceData } from '../../../types/hod';
import {
  GraduationCap,
  Search,
  Eye,
  Edit2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface HodStudentTableProps {
  students: HodStudentSummary[];
  loading: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  programFilter: number | null;
  sectionFilter: number | null;
  semesterFilter: number | null;
  referenceData: HodStudentReferenceData | null;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onProgramFilterChange: (programId: number | null) => void;
  onSectionFilterChange: (sectionId: number | null) => void;
  onSemesterFilterChange: (semester: number | null) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onViewDetails: (id: number) => void;
  onEdit: (student: HodStudentSummary) => void;
  onChangeStatus: (student: HodStudentSummary) => void;
}

export const HodStudentTable: React.FC<HodStudentTableProps> = ({
  students,
  loading,
  page,
  size,
  totalElements,
  totalPages,
  search,
  statusFilter,
  programFilter,
  sectionFilter,
  semesterFilter,
  referenceData,
  onSearchChange,
  onStatusFilterChange,
  onProgramFilterChange,
  onSectionFilterChange,
  onSemesterFilterChange,
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

  // Filter sections dependent on selected program if applicable
  const availableSections = referenceData?.sections.filter((s) =>
    programFilter === null ? true : s.programId === programFilter
  ) || [];

  return (
    <Card className="border border-gray-800 bg-gray-900/40 rounded-2xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Department Student Roster</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Undergraduate and postgraduate students enrolled in your department ({totalElements} total)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={loading}
            className="border-gray-700/60 text-gray-300 hover:text-white self-start sm:self-auto"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reg no, name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={programFilter ?? ''}
              onChange={(e) =>
                onProgramFilterChange(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
            >
              <option value="">All Department Programs</option>
              {referenceData?.programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter (Dependent) */}
          <div>
            <select
              value={sectionFilter ?? ''}
              onChange={(e) =>
                onSectionFilterChange(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
            >
              <option value="">All Sections</option>
              {availableSections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name} ({s.programCode})
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              value={semesterFilter ?? ''}
              onChange={(e) =>
                onSemesterFilterChange(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Register Number</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Program & Degree</th>
              <th className="py-3 px-4 text-center">Semester / Section</th>
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
                    <div className="h-4 w-28 bg-gray-800 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-32 bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-24 bg-gray-800/60 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 w-36 bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-16 bg-gray-800/60 rounded" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-5 w-20 bg-gray-800 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="h-5 w-16 bg-gray-800 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-6 w-16 bg-gray-800 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-600 opacity-60" />
                  <p className="font-semibold text-gray-300 text-sm">No students found</p>
                  <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                    {search || statusFilter !== 'ALL' || programFilter !== null || sectionFilter !== null || semesterFilter !== null
                      ? 'No students matched the active filter criteria.'
                      : 'No students are currently enrolled in this department.'}
                  </p>
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-white">
                    {s.registerNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-100">{s.fullName}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{s.email || '—'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-gray-200 font-medium">{s.programName || '—'}</div>
                    <div className="text-[11px] text-purple-400 font-mono">
                      {s.programCode} • {s.degreeType || 'Degree'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800/60 border border-gray-700/60 text-[11px] font-medium text-gray-300">
                      <span>Sem {s.currentSemester || '—'}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-teal-400 font-semibold">Sec {s.sectionName || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(s.status)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(s.id)}
                        className="text-gray-300 hover:text-white px-2 py-1 h-auto"
                        title="View Student Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(s)}
                        className="text-purple-400 hover:text-purple-300 px-2 py-1 h-auto"
                        title="Edit Academic Placement"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChangeStatus(s)}
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
      {!loading && students.length > 0 && (
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div>
            Showing {page * size + 1} to {Math.min((page + 1) * size, totalElements)} of {totalElements} students
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
