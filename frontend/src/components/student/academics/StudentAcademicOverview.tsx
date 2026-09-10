import React from 'react';
import { Card, Badge } from '../../ui';
import { StudentAcademicOverview as OverviewType } from '../../../types/studentAcademic';
import {
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  Award,
  Hash,
  CheckCircle2,
} from 'lucide-react';

interface StudentAcademicOverviewProps {
  overview: OverviewType;
  totalCredits: number;
  subjectCount: number;
}

export const StudentAcademicOverview: React.FC<StudentAcademicOverviewProps> = ({
  overview,
  totalCredits,
  subjectCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Student Profile Identity Banner */}
      <Card className="p-5 bg-gradient-to-r from-[#11141C] via-[#141824] to-[#11141C] border-[#1E2330]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 shadow-card">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {overview.studentName || 'Student Academic Profile'}
                </h2>
                <Badge variant={overview.status === 'ACTIVE' ? 'teal' : 'neutral'} dot size="sm">
                  {overview.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  {overview.registerNumber}
                </span>
                {overview.rollNumber && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="font-mono text-gray-400">Roll: {overview.rollNumber}</span>
                  </>
                )}
                {overview.admissionYear && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">Batch {overview.admissionYear}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#171A23] border border-[#222838] text-right">
              <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">
                Current Semester
              </div>
              <div className="text-sm font-bold text-teal-300 font-mono">
                Semester {overview.currentSemester || '--'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Academic Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Department */}
        <Card className="p-4 bg-[#11141C] border-[#1E2330] hover:border-teal-500/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">
                Department
              </span>
              <p className="text-xs font-semibold text-gray-100 truncate mt-0.5" title={overview.departmentName}>
                {overview.departmentName || 'Not Assigned'}
              </p>
              {overview.departmentCode && (
                <span className="text-[10px] font-mono text-teal-400 mt-1 inline-block">
                  {overview.departmentCode}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Program */}
        <Card className="p-4 bg-[#11141C] border-[#1E2330] hover:border-blue-500/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">
                Program / Degree
              </span>
              <p className="text-xs font-semibold text-gray-100 truncate mt-0.5" title={overview.programName}>
                {overview.programName || 'Not Enrolled'}
              </p>
              {overview.degreeLevel && (
                <span className="text-[10px] font-mono text-blue-400 mt-1 inline-block">
                  {overview.degreeLevel.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Section & Academic Year */}
        <Card className="p-4 bg-[#11141C] border-[#1E2330] hover:border-purple-500/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">
                Section & Cohort
              </span>
              <p className="text-xs font-semibold text-gray-100 truncate mt-0.5">
                {overview.sectionName ? `Section ${overview.sectionName}` : 'Unallocated Section'}
              </p>
              <span className="text-[10px] font-mono text-purple-400 mt-1 inline-block">
                {overview.academicYearName || 'Current AY'}
              </span>
            </div>
          </div>
        </Card>

        {/* Registered Credits */}
        <Card className="p-4 bg-[#11141C] border-[#1E2330] hover:border-orange-500/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">
                Semester Credits
              </span>
              <p className="text-xs font-semibold text-gray-100 mt-0.5">
                {totalCredits} Credits Registered
              </p>
              <span className="text-[10px] font-mono text-orange-400 mt-1 inline-block">
                {subjectCount} Active Subjects
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
