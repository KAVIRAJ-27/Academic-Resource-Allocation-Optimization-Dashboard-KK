import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, EmptyState } from '../../ui';
import { FacultySubject } from '../../../types/faculty';
import { BookOpen, Eye, Clock, Users, ArrowRight } from 'lucide-react';

interface FacultySubjectTableProps {
  subjects: FacultySubject[];
}

export const FacultySubjectTable: React.FC<FacultySubjectTableProps> = ({ subjects }) => {
  const navigate = useNavigate();

  if (!subjects || subjects.length === 0) {
    return (
      <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-8 shadow-card">
        <EmptyState
          icon={BookOpen}
          title="No subjects are currently assigned to you."
          description="Assigned subjects will appear here once administrative course allocations for the semester are finalized."
        />
      </div>
    );
  }

  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl overflow-hidden shadow-card">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#171A23] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Subject Code</th>
              <th scope="col" className="px-5 py-3.5">Subject Name</th>
              <th scope="col" className="px-5 py-3.5">Course / Program</th>
              <th scope="col" className="px-5 py-3.5">Semester & Year</th>
              <th scope="col" className="px-5 py-3.5">Section</th>
              <th scope="col" className="px-5 py-3.5">Credits / Hours</th>
              <th scope="col" className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2330]">
            {subjects.map((subj) => (
              <tr
                key={subj.assignmentId}
                className="hover:bg-[#151923] transition-colors group cursor-pointer"
                onClick={() => navigate(`/faculty/subjects/${subj.subjectId}`)}
              >
                <td className="px-5 py-4 whitespace-nowrap">
                  <Badge variant="teal" size="sm">
                    {subj.subjectCode}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-white group-hover:text-teal-300 transition-colors">
                    {subj.subjectName}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <span className="capitalize">{subj.subjectType?.toLowerCase() || 'Theory'}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-300">
                  {subj.programCode ? (
                    <div>
                      <span className="font-semibold text-gray-200">{subj.programCode}</span>
                      {subj.programName && (
                        <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                          {subj.programName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-xs text-gray-300 whitespace-nowrap">
                  <div>
                    {subj.semesterNumber ? `Semester ${subj.semesterNumber}` : subj.semesterName || '—'}
                  </div>
                  {subj.academicYearName && (
                    <div className="text-[11px] text-gray-500">{subj.academicYearName}</div>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {subj.sectionName ? (
                    <Badge variant="neutral" size="sm">
                      Sec {subj.sectionName}
                    </Badge>
                  ) : (
                    <span className="text-gray-500 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-xs whitespace-nowrap">
                  <span className="font-semibold text-white">{subj.credits} Credits</span>
                  {subj.hoursPerWeek ? (
                    <span className="text-gray-400 block text-[11px]">
                      {subj.hoursPerWeek} hrs/week
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/faculty/subjects/${subj.subjectId}`);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden divide-y divide-[#1E2330]">
        {subjects.map((subj) => (
          <div
            key={subj.assignmentId}
            className="p-4 space-y-3 hover:bg-[#151923] transition-colors"
            onClick={() => navigate(`/faculty/subjects/${subj.subjectId}`)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="teal" size="sm" className="mb-1">
                  {subj.subjectCode}
                </Badge>
                <h4 className="font-bold text-white text-sm">{subj.subjectName}</h4>
              </div>
              <Badge variant="neutral" size="sm">
                {subj.subjectType}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 pt-1 border-t border-[#1E2330]">
              <div>
                <span className="text-gray-500 block">Course:</span>
                <span className="text-gray-200 font-medium">{subj.programCode || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Section:</span>
                <span className="text-gray-200 font-medium">{subj.sectionName ? `Section ${subj.sectionName}` : '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Semester:</span>
                <span className="text-gray-200 font-medium">Sem {subj.semesterNumber || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Workload:</span>
                <span className="text-gray-200 font-medium">{subj.credits} cr / {subj.hoursPerWeek || 0} hrs</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 justify-between text-xs"
              >
                <span>View Subject Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
