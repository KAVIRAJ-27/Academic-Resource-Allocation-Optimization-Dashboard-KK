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
    <Card className="p-6 border border-[#D8C9A8] bg-white shadow-none rounded-xl flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FBF9F3] text-[#B8A16A] border border-[#E8E0D0]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#202020]">Faculty Workload Overview</h3>
              <p className="text-xs text-[#77736A]">Department faculty teaching assignments & workload</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#77736A] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#FBF9F3] border border-[#D9D2C3] rounded pl-8 pr-3 py-1.5 text-xs text-[#202020] placeholder-[#77736A] focus:outline-none focus:border-[#B8A16A] focus:bg-white focus:ring-1 focus:ring-[#B8A16A]/20 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>

        {filteredFaculty.length === 0 ? (
          <div className="py-12 text-center text-[#77736A] text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 text-[#77736A] opacity-60" />
            <p className="font-serif font-bold text-[#202020]">No faculty records found</p>
            <p className="text-[#77736A] mt-0.5">
              {searchTerm ? 'No faculty matching search filter.' : 'No faculty members assigned to this department yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E0D0] bg-[#F8F6F0] text-[#555555] font-serif font-semibold tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Faculty Member</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3 text-center">Courses</th>
                  <th className="py-2.5 px-3 text-center">Total Hrs</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D0]">
                {filteredFaculty.slice(0, 6).map((f) => (
                  <tr key={f.facultyId} className="hover:bg-[#F4F0E6] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#202020] truncate max-w-[160px] sm:max-w-[200px]">
                        {f.facultyName}
                      </div>
                      <div className="text-[11px] text-[#77736A] font-mono">{f.employeeId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#555555]">
                      {f.designation || 'Faculty'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#B8A16A] bg-[#FBF9F3] px-2 py-0.5 rounded border border-[#E8E0D0]">
                        <BookOpen className="w-3 h-3" />
                        {f.assignedSubjectsCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#3F7655] bg-[#F0F5F2] px-2 py-0.5 rounded border border-[#B6D1C1]">
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

      <div className="mt-4 pt-3 border-t border-[#E8E0D0] flex items-center justify-between text-xs text-[#77736A]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/workload')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-[#B8A16A] hover:text-[#202020] p-0 font-medium"
        >
          Workload Metrics
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/hod/faculty')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-[#3F7655] hover:text-[#202020] p-0 font-medium"
        >
          Faculty Directory
        </Button>
      </div>
    </Card>
  );
};
