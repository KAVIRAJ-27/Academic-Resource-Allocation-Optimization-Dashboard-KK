import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { Button } from '../../ui';
import { FacultyCourse } from '../../../types/faculty';

interface FacultySubjectFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  programId?: number;
  onProgramChange: (val?: number) => void;
  semester?: number;
  onSemesterChange: (val?: number) => void;
  availablePrograms?: FacultyCourse[];
  onReset: () => void;
}

export const FacultySubjectFilters: React.FC<FacultySubjectFiltersProps> = ({
  search,
  onSearchChange,
  programId,
  onProgramChange,
  semester,
  onSemesterChange,
  availablePrograms = [],
  onReset,
}) => {
  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 mb-6 shadow-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by subject code or title..."
            className="w-full pl-9 pr-4 py-2 bg-[#171A23] border border-[#1E2330] rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
          />
        </div>

        {/* Dropdowns and action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Program filter */}
          {availablePrograms.length > 0 && (
            <select
              value={programId ?? ''}
              onChange={(e) => onProgramChange(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-[#171A23] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
            >
              <option value="">All Programs</option>
              {availablePrograms.map((p) => (
                <option key={p.programId} value={p.programId}>
                  {p.programCode} - {p.programName}
                </option>
              ))}
            </select>
          )}

          {/* Semester filter */}
          <select
            value={semester ?? ''}
            onChange={(e) => onSemesterChange(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-[#171A23] border border-[#1E2330] rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

          {/* Reset button */}
          {(search || programId !== undefined || semester !== undefined) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="border-[#1E2330] text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
