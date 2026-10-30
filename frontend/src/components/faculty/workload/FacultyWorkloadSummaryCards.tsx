import React from 'react';
import { FacultyWorkloadSummary } from '../../../types/faculty';
import { Badge } from '../../ui';
import { Clock, BookOpen, Layers, Activity, Calendar, AlertCircle } from 'lucide-react';

interface FacultyWorkloadSummaryCardsProps {
  summary?: FacultyWorkloadSummary | null;
}

export const FacultyWorkloadSummaryCards: React.FC<FacultyWorkloadSummaryCardsProps> = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'BALANCED':
        return <Badge variant="success">Balanced</Badge>;
      case 'OVERLOAD':
        return <Badge variant="danger">Overload</Badge>;
      case 'UNDERLOAD':
        return <Badge variant="warning">Underload</Badge>;
      case 'PENDING_CALCULATION':
        return <Badge variant="neutral">Pending Calculation</Badge>;
      default:
        return <Badge variant="neutral">{status || 'Not available'}</Badge>;
    }
  };

  const totalHrs = summary.totalHours ?? 0;
  const teachingHrs = summary.teachingHours ?? 0;
  const labHrs = summary.labHours ?? 0;
  const otherHrs = summary.otherHours ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Assigned Hours */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-teal-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">Total Workload</span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalHrs}</span>
          <span className="text-xs text-gray-400 font-medium">hrs / week</span>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
          <span className="text-gray-400">Load Status</span>
          {getStatusBadge(summary.workloadStatus)}
        </div>
      </div>

      {/* 2. Teaching & Lab Hours */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">Hour Distribution</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <div className="text-lg font-bold text-slate-900">{teachingHrs}h</div>
            <div className="text-xs text-gray-400">Theory / Lecture</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{labHrs}h</div>
            <div className="text-xs text-gray-400">Lab / Practical</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-gray-400">
          <span>Other duties</span>
          <span className="font-medium text-gray-300">{otherHrs}h</span>
        </div>
      </div>

      {/* 3. Assigned Subjects & Sections */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">Academic Portfolio</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div>
            <span className="text-2xl font-bold text-slate-900">{summary.subjectCount ?? 0}</span>
            <span className="text-xs text-gray-400 ml-1">Subjects</span>
          </div>
          <span className="text-gray-600">|</span>
          <div>
            <span className="text-2xl font-bold text-slate-900">{summary.sectionCount ?? 0}</span>
            <span className="text-xs text-gray-400 ml-1">Sections</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-gray-400">
          <span>Instruction scope</span>
          <span className="font-medium text-purple-300">Active assignments</span>
        </div>
      </div>

      {/* 4. Academic Period & Limit */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-orange-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">Academic Term</span>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-sm font-semibold text-white truncate">
            {summary.academicYear || 'Current Academic Year'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {summary.semester || 'Current Semester'}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-gray-400">
          <span>Target weekly limit</span>
          <span className="font-medium text-white">{summary.maxWeeklyHoursLimit || 20} hrs</span>
        </div>
      </div>
    </div>
  );
};
