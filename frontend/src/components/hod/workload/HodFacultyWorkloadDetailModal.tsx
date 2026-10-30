import React from 'react';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodFacultyWorkloadDetail } from '../../../types/hod';
import {
  Clock,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface HodFacultyWorkloadDetailModalProps {
  workloadDetail: HodFacultyWorkloadDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HodFacultyWorkloadDetailModal: React.FC<HodFacultyWorkloadDetailModalProps> = ({
  workloadDetail,
  isOpen,
  onClose,
}) => {
  if (!workloadDetail) return null;

  const getStatusBadge = (status: string) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Faculty Workload & Course Allocations" maxWidth="xl">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Summary */}
        <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-lg">
              {workloadDetail.facultyName?.charAt(0) || 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{workloadDetail.facultyName}</h3>
                {getStatusBadge(workloadDetail.workloadStatus)}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {workloadDetail.employeeId} • {workloadDetail.designation || 'Faculty'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400">Total Workload</p>
            <p className="text-xl font-bold text-slate-900 font-mono">
              {workloadDetail.totalHours ? Number(workloadDetail.totalHours).toFixed(1) : '0.0'} hrs/wk
            </p>
          </div>
        </div>

        {/* Workload Hours Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <p className="text-[11px] text-teal-400 font-medium">Teaching Hours</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {workloadDetail.teachingHours ? Number(workloadDetail.teachingHours).toFixed(1) : '0.0'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Lecture & tutorial contact</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-[11px] text-blue-400 font-medium">Lab Contact</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {workloadDetail.labHours ? Number(workloadDetail.labHours).toFixed(1) : '0.0'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Practical lab sessions</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-[11px] text-purple-400 font-medium">Other Service</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {workloadDetail.otherHours ? Number(workloadDetail.otherHours).toFixed(1) : '0.0'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Dept duties & advising</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-[11px] text-amber-400 font-medium">Academic Term</p>
            <p className="text-base font-bold text-slate-900 mt-1">
              {workloadDetail.academicYear || 'Current'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{workloadDetail.semesterName || 'Active Semester'}</p>
          </div>
        </div>

        {/* Assigned Subjects Table */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-3">
            Assigned Teaching Load ({workloadDetail.assignments?.length || 0} subjects)
          </h4>

          {!workloadDetail.assignments || workloadDetail.assignments.length === 0 ? (
            <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-center text-xs text-gray-500">
              No course assignments currently linked to this faculty record.
            </div>
          ) : (
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/70 text-gray-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Program</th>
                    <th className="py-2.5 px-3 text-center">Section</th>
                    <th className="py-2.5 px-3 text-center">Credits</th>
                    <th className="py-2.5 px-3 text-center">Weekly Hours</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {workloadDetail.assignments.map((sub) => (
                    <tr key={sub.assignmentId} className="hover:bg-gray-800/20">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-white">{sub.subjectName}</div>
                        <div className="text-[11px] text-purple-400 font-mono">{sub.subjectCode}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {sub.programName || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-800 font-medium font-medium">
                        {sub.sectionName || 'All'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-teal-400 font-semibold">
                        {sub.credits || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700 font-medium">
                        {sub.hoursPerWeek ? Number(sub.hoursPerWeek).toFixed(1) : '—'} hrs
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Badge variant="teal">{sub.status || 'ACTIVE'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workload History */}
        {workloadDetail.history && workloadDetail.history.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-3">
              Workload History Logs
            </h4>
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/70 text-gray-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Academic Period</th>
                    <th className="py-2.5 px-3 text-center">Teaching Hrs</th>
                    <th className="py-2.5 px-3 text-center">Lab Hrs</th>
                    <th className="py-2.5 px-3 text-center">Total Hrs</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {workloadDetail.history.map((hist) => (
                    <tr key={hist.workloadId} className="hover:bg-gray-800/20">
                      <td className="py-2.5 px-3 text-slate-700 font-medium font-medium">
                        {hist.academicYear} • {hist.semesterName}
                      </td>
                      <td className="py-2.5 px-3 text-center text-teal-400">
                        {hist.teachingHours ? Number(hist.teachingHours).toFixed(1) : '0.0'} hrs
                      </td>
                      <td className="py-2.5 px-3 text-center text-blue-400">
                        {hist.labHours ? Number(hist.labHours).toFixed(1) : '0.0'} hrs
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-white">
                        {hist.totalHours ? Number(hist.totalHours).toFixed(1) : '0.0'} hrs
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {getStatusBadge(hist.workloadStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
