import React from 'react';
import { Modal, Button, Badge } from '../../ui';
import { StudentSubjectDetails } from '../../../types/studentAcademic';
import {
  BookOpen,
  User,
  Mail,
  Clock,
  Building2,
  GraduationCap,
  Award,
  Hash,
} from 'lucide-react';

interface StudentSubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: StudentSubjectDetails | null;
  loading: boolean;
  error: string | null;
}

export const StudentSubjectDetailsModal: React.FC<StudentSubjectDetailsModalProps> = ({
  isOpen,
  onClose,
  subject,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subject?.name || 'Subject Details'}
      description={
        subject
          ? `${subject.code} • Semester ${subject.semesterNumber || '--'}`
          : 'Loading subject details...'
      }
      maxWidth="lg"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            <span className="text-xs text-gray-400">Loading syllabus and instructor telemetry...</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {subject && !loading && (
          <div className="space-y-4">
            {/* Meta Tags Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="teal" dot size="sm">
                {subject.subjectType}
              </Badge>
              <Badge variant="blue" size="sm">
                {subject.credits} Credits
              </Badge>
              <Badge variant={subject.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                {subject.status}
              </Badge>
              {subject.hoursPerWeek && (
                <Badge variant="purple" size="sm">
                  {subject.hoursPerWeek} Hrs / Wk
                </Badge>
              )}
            </div>

            {/* Academic Program Scope Card */}
            <div className="p-3.5 rounded-xl bg-[#171A23] border border-[#222838] space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                Degree & Department Affiliation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Enrolled Program</span>
                  <span className="font-semibold text-gray-100">{subject.programName || '--'}</span>
                  {subject.programCode && (
                    <span className="font-mono text-[10px] text-teal-400 block">{subject.programCode}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Department</span>
                  <span className="font-semibold text-gray-100">{subject.departmentName || '--'}</span>
                  {subject.departmentCode && (
                    <span className="font-mono text-[10px] text-teal-400 block">{subject.departmentCode}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Faculty Instructor Details */}
            <div className="p-3.5 rounded-xl bg-[#171A23] border border-[#222838] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  Course Faculty Instructor
                </span>
                {subject.facultyName && (
                  <Badge variant="teal" size="sm">
                    Assigned
                  </Badge>
                )}
              </div>

              {subject.facultyName ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-100">{subject.facultyName}</h4>
                    <p className="text-xs text-gray-400">
                      {subject.facultyDesignation || 'Faculty Member'}
                      {subject.facultyQualification && ` • ${subject.facultyQualification}`}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400 flex-wrap">
                      {subject.facultyEmployeeId && (
                        <span className="font-mono">ID: {subject.facultyEmployeeId}</span>
                      )}
                      {subject.facultyEmail && (
                        <span className="flex items-center gap-1 text-teal-400">
                          <Mail className="w-3 h-3" />
                          {subject.facultyEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-gray-400 italic">
                  Faculty instructor assignment pending publication by department.
                </div>
              )}
            </div>

            {/* Cohort Section Assignment */}
            <div className="p-3 rounded-xl bg-[#141822] border border-[#1E2330] flex items-center justify-between text-xs">
              <span className="text-gray-400">Enrolled Section</span>
              <span className="font-semibold text-gray-200">
                {subject.sectionName ? `Section ${subject.sectionName}` : 'All Sections'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
