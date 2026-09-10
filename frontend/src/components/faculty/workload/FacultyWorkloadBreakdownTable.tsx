import React from 'react';
import { FacultyWorkloadBreakdownItem } from '../../../types/faculty';
import { Badge, EmptyState } from '../../ui';
import { BookOpen, Layers, Clock } from 'lucide-react';

interface FacultyWorkloadBreakdownTableProps {
  breakdown: FacultyWorkloadBreakdownItem[];
}

export const FacultyWorkloadBreakdownTable: React.FC<FacultyWorkloadBreakdownTableProps> = ({
  breakdown,
}) => {
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-8 shadow-card">
        <EmptyState
          icon={BookOpen}
          title="No workload breakdown is available."
          description="Subject and section teaching breakdown will appear once administrative subject assignments are made."
        />
      </div>
    );
  }

  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-[#1E2330] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Assigned Teaching Breakdown</h3>
          <p className="text-xs text-gray-400 mt-0.5">Instructional hours by course, subject, and section</p>
        </div>
        <Badge variant="teal" size="sm">
          {breakdown.length} {breakdown.length === 1 ? 'Assignment' : 'Assignments'}
        </Badge>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#171A23] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Subject Code</th>
              <th scope="col" className="px-5 py-3.5">Subject Name</th>
              <th scope="col" className="px-5 py-3.5">Course / Program</th>
              <th scope="col" className="px-5 py-3.5">Section</th>
              <th scope="col" className="px-5 py-3.5">Weekly Hours</th>
              <th scope="col" className="px-5 py-3.5">Credits</th>
              <th scope="col" className="px-5 py-3.5">Academic Period</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2330]">
            {breakdown.map((item, idx) => (
              <tr key={item.subjectId ? `${item.subjectId}-${idx}` : idx} className="hover:bg-[#151923] transition-colors">
                <td className="px-5 py-4 whitespace-nowrap">
                  <Badge variant="teal" size="sm">
                    {item.subjectCode || 'N/A'}
                  </Badge>
                </td>
                <td className="px-5 py-4 font-medium text-white">
                  {item.subjectName || 'Unknown Subject'}
                </td>
                <td className="px-5 py-4 text-gray-300">
                  {item.courseName || '—'}
                </td>
                <td className="px-5 py-4">
                  {item.sectionName ? (
                    <Badge variant="purple" size="sm">
                      {item.sectionName}
                    </Badge>
                  ) : (
                    <span className="text-gray-500 text-xs">All Sections</span>
                  )}
                </td>
                <td className="px-5 py-4 font-semibold text-white">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{item.hours} hrs/wk</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-400">
                  {item.credits ?? '—'}
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">
                  {item.academicPeriod || 'Current Semester'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[#1E2330]">
        {breakdown.map((item, idx) => (
          <div key={item.subjectId ? `${item.subjectId}-${idx}` : idx} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="teal" size="sm">
                {item.subjectCode || 'N/A'}
              </Badge>
              <div className="flex items-center gap-1 text-teal-400 font-semibold text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{item.hours} hrs/wk</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-white">
              {item.subjectName}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span>{item.courseName || 'Course'}</span>
              <span>{item.sectionName ? `Sec ${item.sectionName}` : 'All Sections'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
