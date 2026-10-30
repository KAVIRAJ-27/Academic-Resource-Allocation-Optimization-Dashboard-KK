import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodFacultySummary } from '../../../types/hod';
import {
  Users,
  Search,
  BookOpen,
  Clock,
  Eye,
} from 'lucide-react';

interface HodWorkloadTableProps {
  facultyWorkloads: HodFacultySummary[];
  onViewBreakdown: (facultyId: number) => void;
}

export const HodWorkloadTable: React.FC<HodWorkloadTableProps> = ({
  facultyWorkloads,
  onViewBreakdown,
}) => {
  const [search, setSearch] = useState('');

  const filteredFaculty = facultyWorkloads.filter(
    (f) =>
      f.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      (f.designation && f.designation.toLowerCase().includes(search.toLowerCase()))
  );

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
    <Card className="border border-gray-800 bg-gray-900/40 rounded-2xl overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Department Faculty Workload Status</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Teaching and departmental service workload hours per faculty ({facultyWorkloads.length} total)
          </p>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60 text-slate-600 font-bold font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Faculty Member</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4 text-center">Courses</th>
              <th className="py-3 px-4 text-center">Total Workload</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredFaculty.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-600 font-medium">
                  <Users className="w-10 h-10 mx-auto mb-2 text-gray-600 opacity-60" />
                  <p className="font-semibold text-slate-700 font-medium text-sm">No faculty records found</p>
                  <p className="text-slate-500 font-medium mt-1 max-w-sm mx-auto">
                    {search
                      ? 'No faculty matched the active search query.'
                      : 'No faculty members are currently assigned to this department.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredFaculty.map((f) => (
                <tr key={f.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white">{f.fullName}</div>
                    <div className="text-[11px] text-slate-600 font-medium font-mono">{f.employeeId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {f.designation || 'Faculty'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      <BookOpen className="w-3 h-3" />
                      {f.assignedSubjectsCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-white bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700 font-mono">
                      <Clock className="w-3 h-3 text-teal-400" />
                      {f.totalWorkloadHours ? Number(f.totalWorkloadHours).toFixed(1) : '0.0'} hrs/wk
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(f.workloadStatus)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewBreakdown(f.id)}
                      className="text-xs border-gray-700/60 text-teal-400 hover:text-white px-2.5 py-1"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Breakdown
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
        Showing {filteredFaculty.length} of {facultyWorkloads.length} department faculty members
      </div>
    </Card>
  );
};
