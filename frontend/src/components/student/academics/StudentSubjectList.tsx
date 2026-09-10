import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from '../../ui';
import { StudentSubject } from '../../../types/studentAcademic';
import { StudentAcademicEmptyState } from './StudentAcademicEmptyState';
import {
  Search,
  BookOpen,
  Eye,
  User,
  X,
} from 'lucide-react';

interface StudentSubjectListProps {
  subjects: StudentSubject[];
  totalSubjects: number;
  availableSemesters: number[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSemester?: number;
  onSemesterChange: (sem?: number) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  onSelectSubject: (subjectId: number) => void;
}

export const StudentSubjectList: React.FC<StudentSubjectListProps> = ({
  subjects,
  totalSubjects,
  availableSemesters,
  searchTerm,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
  selectedType,
  onTypeChange,
  onSelectSubject,
}) => {
  const isFilterActive = !!searchTerm || selectedSemester !== undefined || selectedType !== 'ALL';

  const clearFilters = () => {
    onSearchChange('');
    onSemesterChange(undefined);
    onTypeChange('ALL');
  };

  return (
    <Card className="bg-[#11141C] border-[#1E2330]">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100 flex items-center gap-2">
                Enrolled Academic Subjects
                <Badge variant="teal" size="sm">
                  {subjects.length} of {totalSubjects}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Course catalog and instructor allocations for your registered degree curriculum
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject code, title, or instructor..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#171A23] border border-[#222838] rounded-xl text-xs text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Semester Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSemester !== undefined ? selectedSemester : ''}
              onChange={(e) =>
                onSemesterChange(e.target.value ? Number(e.target.value) : undefined)
              }
              className="px-3 py-2 bg-[#171A23] border border-[#222838] rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="">All Semesters</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>

            {/* Subject Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="px-3 py-2 bg-[#171A23] border border-[#222838] rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="ALL">All Types</option>
              <option value="THEORY">Theory</option>
              <option value="PRACTICAL">Practical / Lab</option>
              <option value="PROJECT">Project</option>
              <option value="ELECTIVE">Elective</option>
            </select>

            {isFilterActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-gray-200 px-2"
                title="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {subjects.length === 0 ? (
          <div className="p-8">
            <StudentAcademicEmptyState
              type={isFilterActive ? 'filter' : 'subjects'}
              onClearFilters={clearFilters}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0D14] border-b border-[#1E2330] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-mono text-[11px] w-24">Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Credits</th>
                    <th className="py-3 px-4">Faculty Instructor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330] text-gray-300">
                  {subjects.map((subj) => (
                    <tr
                      key={subj.id}
                      className="border-[#1E2330] hover:bg-[#171A23]/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectSubject(subj.id)}
                    >
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-teal-300">
                        {subj.code}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-xs text-gray-100 group-hover:text-teal-300 transition-colors block">
                          {subj.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                        {subj.semesterNumber ? `Sem ${subj.semesterNumber}` : '--'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            subj.subjectType === 'THEORY'
                              ? 'teal'
                              : subj.subjectType === 'PRACTICAL'
                              ? 'blue'
                              : 'purple'
                          }
                          size="sm"
                        >
                          {subj.subjectType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-gray-200">
                        {subj.credits}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-300">
                        {subj.facultyName ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[160px]">{subj.facultyName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={subj.status === 'ACTIVE' ? 'success' : 'neutral'}
                          size="sm"
                          dot
                        >
                          {subj.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-3 h-3 text-gray-400 group-hover:text-teal-400" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubject(subj.id);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="md:hidden divide-y divide-[#1E2330]">
              {subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="p-4 space-y-2.5 hover:bg-[#171A23]/50 transition-colors cursor-pointer"
                  onClick={() => onSelectSubject(subj.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-teal-300 block">
                        {subj.code}
                      </span>
                      <h4 className="text-xs font-semibold text-gray-100 mt-0.5">{subj.name}</h4>
                    </div>
                    <Badge variant="teal" size="sm">
                      {subj.credits} Cr
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-400">
                    <span>Sem {subj.semesterNumber || '--'}</span>
                    <span>•</span>
                    <span>{subj.subjectType}</span>
                    {subj.facultyName && (
                      <>
                        <span>•</span>
                        <span className="text-gray-300">{subj.facultyName}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Badge variant={subj.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm" dot>
                      {subj.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5 text-teal-400" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSubject(subj.id);
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
