import React from 'react';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodFacultyDetail } from '../../../types/hod';
import {
  Briefcase,
  GraduationCap,
  Calendar,
  Mail,
  Building,
  FileText,
  Clock,
} from 'lucide-react';

interface HodFacultyDetailModalProps {
  faculty: HodFacultyDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const HodFacultyDetailModal: React.FC<HodFacultyDetailModalProps> = ({
  faculty,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!faculty) return null;

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
        return <Badge variant="neutral">CALCULATION PENDING</Badge>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Faculty Profile & Assignments" maxWidth="lg">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Profile Summary */}
        <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-lg">
              {faculty.fullName?.charAt(0) || 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{faculty.fullName}</h3>
                {getStatusBadge(faculty.status)}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{faculty.employeeId}</p>
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="text-xs border-gray-700 self-start sm:self-auto">
              Edit Details
            </Button>
          )}
        </div>

        {/* Academic Details Grid */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-3">
            Academic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Email Address</p>
                <p className="text-gray-200 font-mono">{faculty.email || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Building className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Department</p>
                <p className="text-gray-200 font-medium">{faculty.departmentName || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Designation</p>
                <p className="text-gray-200 font-medium">{faculty.designation || 'Faculty'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Qualification</p>
                <p className="text-gray-200">{faculty.qualification || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Joining Date</p>
                <p className="text-gray-200">{faculty.joiningDate || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Workload Status</p>
                <div className="mt-0.5">{getWorkloadBadge(faculty.workloadStatus)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workload Metric Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-3">
            Workload Metric Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <p className="text-[11px] text-teal-400 font-medium">Teaching Hours</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {faculty.teachingHours ? Number(faculty.teachingHours).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-[11px] text-blue-400 font-medium">Lab Hours</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {faculty.labHours ? Number(faculty.labHours).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-[11px] text-purple-400 font-medium">Other Service</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {faculty.otherHours ? Number(faculty.otherHours).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-[11px] text-amber-400 font-medium">Total Workload</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {faculty.totalWorkloadHours ? Number(faculty.totalWorkloadHours).toFixed(1) : '0.0'} hrs
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">
              Assigned Courses ({faculty.assignedSubjects?.length || 0})
            </h4>
          </div>

          {!faculty.assignedSubjects || faculty.assignedSubjects.length === 0 ? (
            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-center text-xs text-gray-500">
              No subjects currently assigned to this faculty member.
            </div>
          ) : (
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/70 text-gray-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Program</th>
                    <th className="py-2.5 px-3 text-center">Section</th>
                    <th className="py-2.5 px-3 text-center">Semester</th>
                    <th className="py-2.5 px-3 text-center">Credits</th>
                    <th className="py-2.5 px-3 text-center">Hrs/Wk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {faculty.assignedSubjects.map((sub) => (
                    <tr key={sub.assignmentId} className="hover:bg-gray-800/20">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{sub.subjectName}</div>
                        <div className="text-[11px] text-purple-400 font-mono">{sub.subjectCode}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {sub.programName || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 font-medium font-medium">
                        {sub.sectionName || 'All'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 font-medium">
                        {sub.semesterName || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-teal-400 font-semibold">
                        {sub.credits || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 font-medium font-mono">
                        {sub.hoursPerWeek || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Resource Requests */}
        {faculty.recentRequests && faculty.recentRequests.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-3">
              Recent Resource Requests ({faculty.recentRequests.length})
            </h4>
            <div className="space-y-2">
              {faculty.recentRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">{req.resourceName}</p>
                      <p className="text-[11px] text-gray-500">
                        {req.purpose} • {req.requestedDate}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      req.status === 'APPROVED'
                        ? 'success'
                        : req.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
