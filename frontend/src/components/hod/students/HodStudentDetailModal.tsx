import React from 'react';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodStudentDetail } from '../../../types/hod';
import {
  GraduationCap,
  Calendar,
  Mail,
  Building,
  Home,
  FileText,
  Layers,
  BookOpen,
} from 'lucide-react';

interface HodStudentDetailModalProps {
  student: HodStudentDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const HodStudentDetailModal: React.FC<HodStudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!student) return null;

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Academic Record" maxWidth="lg">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Summary */}
        <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-lg">
              {student.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">{student.fullName}</h3>
                {getStatusBadge(student.status)}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{student.registerNumber}</p>
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="text-xs border-gray-700 self-start sm:self-auto">
              Edit Placement
            </Button>
          )}
        </div>

        {/* Academic Placement Information */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Academic Placement
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Building className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Department</p>
                <p className="text-gray-200 font-medium">{student.departmentName || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Layers className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Program / Degree</p>
                <p className="text-gray-200 font-medium">
                  {student.programName} ({student.programCode})
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Current Semester</p>
                <p className="text-teal-400 font-bold">Semester {student.currentSemester || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Admission Year & Section</p>
                <p className="text-gray-200">
                  {student.admissionYear || '—'} • Section {student.sectionName || '—'}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Institutional Email</p>
                <p className="text-gray-200 font-mono">{student.email || '—'}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-[11px]">Degree Type</p>
                <p className="text-purple-300 font-medium">{student.degreeType || 'Undergraduate'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hostel Accommodation Summary */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Hostel Accommodation Status
          </h4>
          {student.hostelInfo?.allocated ? (
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    {student.hostelInfo.hostelBlock || 'Hostel Block'} — Room {student.hostelInfo.roomNumber}
                  </p>
                  <p className="text-teal-300/80 text-[11px] mt-0.5">
                    Bed Designation: {student.hostelInfo.bedNumber || 'Assigned'}
                  </p>
                </div>
              </div>
              <Badge variant="teal">ALLOCATED</Badge>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-500 flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-600" />
              <span>No active hostel room accommodation assigned for this student.</span>
            </div>
          )}
        </div>

        {/* Recent Academic Resource Requests */}
        {student.recentRequests && student.recentRequests.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent Academic Resource Requests ({student.recentRequests.length})
            </h4>
            <div className="space-y-2">
              {student.recentRequests.map((req) => (
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
