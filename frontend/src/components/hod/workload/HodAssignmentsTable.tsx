import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { HodDepartmentAssignmentItem } from '../../../types/hod';
import {
  BookOpen,
  Search,
} from 'lucide-react';

interface HodAssignmentsTableProps {
  assignments: HodDepartmentAssignmentItem[];
}

export const HodAssignmentsTable: React.FC<HodAssignmentsTableProps> = ({
  assignments,
}) => {
  const [search, setSearch] = useState('');

  const filteredAssignments = assignments.filter(
    (a) =>
      a.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      a.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
      a.facultyName.toLowerCase().includes(search.toLowerCase()) ||
      a.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      (a.programName && a.programName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card className="border border-gray-800 bg-gray-900/40 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Department Course Assignments</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Active faculty-to-course teaching assignments for your department ({assignments.length} total)
          </p>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject, faculty, program..."
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
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Assigned Faculty</th>
              <th className="py-3 px-4">Program</th>
              <th className="py-3 px-4 text-center">Semester & Section</th>
              <th className="py-3 px-4 text-center">Credits</th>
              <th className="py-3 px-4 text-right">Academic Year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-600 font-medium">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-600 opacity-60" />
                  <p className="font-semibold text-slate-700 font-medium text-sm">No course assignments found</p>
                  <p className="text-slate-500 font-medium mt-1 max-w-sm mx-auto">
                    {search
                      ? 'No assignments matched the current search query.'
                      : 'No faculty subject assignments have been recorded for this department.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredAssignments.map((a) => (
                <tr key={a.assignmentId} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white">{a.subjectName}</div>
                    <div className="text-[11px] text-purple-400 font-mono">{a.subjectCode}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-teal-300">{a.facultyName}</div>
                    <div className="text-[11px] text-slate-600 font-medium font-mono">{a.employeeId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <div>{a.programName || '—'}</div>
                    <div className="text-[11px] text-slate-500 font-medium font-mono">{a.programCode}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800/60 border border-gray-700/60 text-[11px] font-medium text-slate-700 font-medium">
                      <span>{a.semesterName || '—'}</span>
                      <span className="text-slate-500 font-medium">•</span>
                      <span className="text-teal-400 font-semibold">Sec {a.sectionName || 'All'}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-teal-400">
                    {a.credits || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 font-medium font-mono text-[11px]">
                    {a.academicYear || 'Current Year'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
        Showing {filteredAssignments.length} of {assignments.length} assignments
      </div>
    </Card>
  );
};
