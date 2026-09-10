import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { HodFacultyWorkloadSummaryItem } from '../../../types/hod';
import {
  Users,
  Search,
  BookOpen,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HodFacultyWorkloadCardProps {
  facultyList: HodFacultyWorkloadSummaryItem[];
}

export const HodFacultyWorkloadCard: React.FC<HodFacultyWorkloadCardProps> = ({
  facultyList,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaculty = facultyList.filter(
    (f) =>
      f.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.designation && f.designation.toLowerCase().includes(searchTerm.toLowerCase()))
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
        return <Badge variant="neutral">CALCULATION PENDING</Badge>;
    }
  };

  return (
    <Card className="p-6 border border-gray-800 bg-gray-900/40 rounded-2xl flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Faculty Workload Overview</h3>
              <p className="text-xs text-gray-400">Department faculty teaching assignments & workload</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800/60 border border-gray-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>

        {filteredFaculty.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-600 opacity-60" />
            <p className="font-medium text-gray-300">No faculty records found</p>
            <p className="text-gray-500 mt-0.5">
              {searchTerm ? 'No faculty matching search filter.' : 'No faculty members assigned to this department yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Faculty Member</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3 text-center">Courses</th>
                  <th className="py-2.5 px-3 text-center">Total Hrs</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredFaculty.slice(0, 6).map((f) => (
                  <tr key={f.facultyId} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white truncate max-w-[160px] sm:max-w-[200px]">
                        {f.facultyName}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">{f.employeeId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {f.designation || 'Faculty'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                        <BookOpen className="w-3 h-3" />
                        {f.assignedSubjectsCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                        <Clock className="w-3 h-3" />
                        {f.totalHours ? Number(f.totalHours).toFixed(1) : '0.0'} hrs
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {getStatusBadge(f.workloadStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/workload')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-purple-400 hover:text-purple-300 p-0"
        >
          Workload Metrics
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/faculty')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-teal-400 hover:text-teal-300 p-0"
        >
          Faculty Directory
        </Button>
      </div>
    </Card>
  );
};
