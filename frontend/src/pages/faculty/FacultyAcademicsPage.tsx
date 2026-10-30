import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, ContentSection } from '../../components/layout';
import { Alert, Button, Card, CardHeader, CardTitle, CardContent, EmptyState } from '../../components/ui';
import {
  FacultyAcademicNavTabs,
  FacultyCourseCard,
  FacultySubjectTable,
  FacultyAcademicSkeleton,
} from '../../components/faculty/academic';
import { useFacultyAcademics } from '../../hooks/useFacultyAcademics';
import {
  GraduationCap,
  BookOpen,
  Users,
  Clock,
  Building2,
  RefreshCw,
  ArrowRight,
  School,
} from 'lucide-react';

export const FacultyAcademicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { overview, courses, loading, error, refresh } = useFacultyAcademics();

  if (loading && !overview) {
    return (
      <PageContainer>
        <FacultyAcademicSkeleton />
      </PageContainer>
    );
  }

  const assignedPrograms = overview?.assignedPrograms || courses || [];
  const assignedSubjects = overview?.assignedSubjects || [];

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Faculty Academic Overview"
        description="Department programs, active subject allocations, and weekly teaching assignments"
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="border-slate-200 text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Tabs */}
      <FacultyAcademicNavTabs
        subjectsCount={overview?.assignedSubjectsCount}
        todayClassesCount={0}
      />

      {error && (
        <Alert variant="error" title="Academic Service Notice" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Institutional Context Banner */}
      {overview?.departmentName && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {overview.departmentName}
                {overview.departmentCode && (
                  <span className="ml-2 text-xs font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    {overview.departmentCode}
                  </span>
                )}
              </h3>
              {overview.institutionName && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <School className="w-3.5 h-3.5 text-gray-500" />
                  {overview.institutionName}
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Read-only Academic Scope & Assignments
          </div>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card hover:border-[#2A3245] transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Assigned Programs</span>
            <GraduationCap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {overview?.assignedCoursesCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Undergraduate & Graduate</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card hover:border-[#2A3245] transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Assigned Subjects</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {overview?.assignedSubjectsCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Current Term Allocation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card hover:border-[#2A3245] transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Assigned Sections</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {overview?.assignedSectionsCount ?? 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Student Class Divisions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card hover:border-[#2A3245] transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Weekly Instruction</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {overview?.totalWeeklyInstructionHours ?? 0} <span className="text-xs text-gray-400 font-normal">hrs/wk</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Total Lecture & Practical Hours</p>
        </div>
      </div>

      {/* Assigned Degree Programs / Courses */}
      <ContentSection
        title="Associated Academic Programs"
        subtitle="Degree curriculums associated with your current teaching assignments"
        className="mb-8"
      >
        {assignedPrograms.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card">
            <EmptyState
              icon={GraduationCap}
              title="No academic courses are currently associated with your assignments."
              description="Programs will appear here once teaching subjects have been allocated to your profile by the department HOD."
              compact
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedPrograms.map((course) => (
              <FacultyCourseCard key={course.programId} course={course} />
            ))}
          </div>
        )}
      </ContentSection>

      {/* Assigned Subjects Summary */}
      <ContentSection
        title="Current Assigned Subjects"
        subtitle="Teaching assignments, sections, credit requirements, and timetable mappings"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/faculty/subjects')}
            className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 text-xs"
          >
            <span>View Full Subjects List</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        }
      >
        <FacultySubjectTable subjects={assignedSubjects} />
      </ContentSection>
    </PageContainer>
  );
};
