import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState } from '../../ui';
import { FacultyWorkloadData } from '../../../types/faculty';
import { Activity, BookOpen, Laptop, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface FacultyWorkloadCardProps {
  workload?: FacultyWorkloadData | null;
}

export const FacultyWorkloadCard: React.FC<FacultyWorkloadCardProps> = ({ workload }) => {
  if (!workload) {
    return (
      <Card className="h-full bg-white border-slate-200 shadow-xs flex flex-col">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Teaching Workload Metrics
            </CardTitle>
            <Badge variant="neutral">Uncalculated</Badge>
          </div>
          <CardDescription>
            Official workload allocation telemetry
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            title="Workload information is not currently available."
            description="Official teaching hours breakdown will appear here once the departmental workload assessment is finalized."
            icon={Activity}
            compact
          />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BALANCED':
        return <Badge variant="teal">BALANCED</Badge>;
      case 'OVERLOAD':
        return <Badge variant="warning">OVERLOAD</Badge>;
      case 'UNDERLOAD':
        return <Badge variant="blue">UNDERLOAD</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const total = Number(workload.totalHours) || 0;
  const teaching = Number(workload.teachingHours) || 0;
  const lab = Number(workload.labHours) || 0;
  const other = Number(workload.otherHours) || 0;

  return (
    <Card className="h-full bg-white border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
      <div>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Teaching Workload Allocation
              </CardTitle>
              <CardDescription>
                {workload.academicYearName || 'Current Academic Year'} &bull; {workload.semesterName || 'Active Semester'}
              </CardDescription>
            </div>
            {getStatusBadge(workload.workloadStatus || 'BALANCED')}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Main Hours Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1 font-semibold">
                Total Hours
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-mono">
                {total} <span className="text-xs text-slate-500 font-normal">hrs</span>
              </span>
            </div>

            <div className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-xl text-center">
              <span className="text-[10px] text-teal-700 uppercase tracking-wider block mb-1 font-semibold flex items-center justify-center gap-1">
                <BookOpen className="w-2.5 h-2.5 text-teal-600" /> Lecture
              </span>
              <span className="text-xl font-extrabold text-teal-800 font-mono">
                {teaching} <span className="text-xs text-teal-600/70 font-normal">hrs</span>
              </span>
            </div>

            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center">
              <span className="text-[10px] text-indigo-700 uppercase tracking-wider block mb-1 font-semibold flex items-center justify-center gap-1">
                <Laptop className="w-2.5 h-2.5 text-indigo-600" /> Practical
              </span>
              <span className="text-xl font-extrabold text-indigo-800 font-mono">
                {lab} <span className="text-xs text-indigo-600/70 font-normal">hrs</span>
              </span>
            </div>

            <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl text-center">
              <span className="text-[10px] text-purple-700 uppercase tracking-wider block mb-1 font-semibold flex items-center justify-center gap-1">
                <Clock className="w-2.5 h-2.5 text-purple-600" /> Other
              </span>
              <span className="text-xl font-extrabold text-purple-800 font-mono">
                {other} <span className="text-xs text-purple-600/70 font-normal">hrs</span>
              </span>
            </div>
          </div>

          {/* Visual Distribution Bar */}
          {total > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Distribution Breakdown</span>
                <span>{total} hrs / week</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/60">
                <div
                  style={{ width: `${(teaching / total) * 100}%` }}
                  className="bg-teal-600 transition-all duration-500"
                  title={`Theory: ${teaching} hrs`}
                />
                <div
                  style={{ width: `${(lab / total) * 100}%` }}
                  className="bg-indigo-600 transition-all duration-500"
                  title={`Lab: ${lab} hrs`}
                />
                <div
                  style={{ width: `${(other / total) * 100}%` }}
                  className="bg-purple-600 transition-all duration-500"
                  title={`Other: ${other} hrs`}
                />
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-600" /> Theory ({Math.round((teaching / total) * 100)}%)
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" /> Practical ({Math.round((lab / total) * 100)}%)
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-600" /> Other ({Math.round((other / total) * 100)}%)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Last Calculated: {workload.calculatedAt ? new Date(workload.calculatedAt).toLocaleDateString() : 'Recent'}
        </span>
        <span className="text-teal-700 font-semibold">HOD Verified</span>
      </div>
    </Card>
  );
};
