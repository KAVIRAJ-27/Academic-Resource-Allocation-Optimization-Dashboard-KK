import React from 'react';
import { FacultyWorkloadHistoryItem } from '../../../types/faculty';
import { Badge, EmptyState } from '../../ui';
import { History, Calendar, Clock } from 'lucide-react';

interface FacultyWorkloadHistoryTableProps {
  history: FacultyWorkloadHistoryItem[];
}

export const FacultyWorkloadHistoryTable: React.FC<FacultyWorkloadHistoryTableProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-card">
        <EmptyState
          icon={History}
          title="No workload history records found."
          description="Historical workload calculations from previous academic periods will appear here once archived."
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'BALANCED':
        return <Badge variant="success">Balanced</Badge>;
      case 'OVERLOAD':
        return <Badge variant="danger">Overload</Badge>;
      case 'UNDERLOAD':
        return <Badge variant="warning">Underload</Badge>;
      default:
        return <Badge variant="neutral">{status || 'Recorded'}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Workload History</h3>
          <p className="text-xs text-gray-400 mt-0.5">Historical workload records from previous evaluation cycles</p>
        </div>
        <Badge variant="neutral" size="sm">
          {history.length} {history.length === 1 ? 'Record' : 'Records'}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Academic Year</th>
              <th scope="col" className="px-5 py-3.5">Semester</th>
              <th scope="col" className="px-5 py-3.5">Total Hours</th>
              <th scope="col" className="px-5 py-3.5">Teaching Hours</th>
              <th scope="col" className="px-5 py-3.5">Lab Hours</th>
              <th scope="col" className="px-5 py-3.5">Workload Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Calculated At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {history.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-medium text-white flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 font-medium" />
                  <span>{item.academicYear || '—'}</span>
                </td>
                <td className="px-5 py-4 text-slate-700 font-medium">
                  {item.semester || '—'}
                </td>
                <td className="px-5 py-4 font-semibold text-white">
                  {item.totalHours} hrs
                </td>
                <td className="px-5 py-4 text-slate-700 font-medium">
                  {item.teachingHours} hrs
                </td>
                <td className="px-5 py-4 text-slate-700 font-medium">
                  {item.labHours} hrs
                </td>
                <td className="px-5 py-4">
                  {getStatusBadge(item.workloadStatus)}
                </td>
                <td className="px-5 py-4 text-right text-xs text-slate-600 font-medium">
                  {item.calculatedAt ? new Date(item.calculatedAt).toLocaleDateString() : 'System Calculated'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
