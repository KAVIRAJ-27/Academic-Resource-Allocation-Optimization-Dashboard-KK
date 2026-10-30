import React, { useState } from 'react';
import {
  PageContainer,
  PageHeader,
  ContentSection,
} from '../../components/layout';
import {
  Button,
  Badge,
} from '../../components/ui';
import {
  BookOpen,
  Clock,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useStudentAcademics } from '../../hooks/useStudentAcademics';
import { StudentAcademicOverview } from '../../components/student/academics/StudentAcademicOverview';
import { StudentAcademicStructureCard } from '../../components/student/academics/StudentAcademicStructureCard';
import { StudentSubjectList } from '../../components/student/academics/StudentSubjectList';
import { StudentTimetable } from '../../components/student/academics/StudentTimetable';
import { StudentSubjectDetailsModal } from '../../components/student/academics/StudentSubjectDetailsModal';
import { StudentAcademicSkeleton } from '../../components/student/academics/StudentAcademicSkeleton';
import { StudentAcademicEmptyState } from '../../components/student/academics/StudentAcademicEmptyState';

export const StudentAcademicsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'timetable' | 'structure'>('subjects');

  const {
    overview,
    subjects,
    filteredSubjects,
    timetable,
    availableSemesters,
    totalCredits,
    loading,
    error,
    refresh,

    // Filters
    searchTerm,
    setSearchTerm,
    selectedSemester,
    setSelectedSemester,
    selectedType,
    setSelectedType,

    // Details Modal
    selectedSubject,
    detailsLoading,
    detailsError,
    fetchSubjectDetails,
    clearSelectedSubject,
  } = useStudentAcademics();

  if (loading && !overview) {
    return (
      <PageContainer>
        <PageHeader
          title="Student Academic Curriculum & Timetable"
          description="Verified degree curriculum, course syllabus, faculty allocations, and weekly schedule."
          badge={<Badge variant="teal" dot>ACADEMIC MODULE</Badge>}
        />
        <StudentAcademicSkeleton />
      </PageContainer>
    );
  }

  if (error && !overview) {
    return (
      <PageContainer>
        <PageHeader
          title="Student Academic Curriculum & Timetable"
          description="Verified degree curriculum, course syllabus, faculty allocations, and weekly schedule."
          badge={<Badge variant="teal" dot>ACADEMIC MODULE</Badge>}
        />
        <div className="py-12">
          <StudentAcademicEmptyState type="error" onRetry={refresh} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Student Academic Curriculum & Timetable"
        description="Unified catalog of enrolled subjects, degree hierarchy, faculty instructors, and weekly classroom schedules."
        badge={<Badge variant="teal" dot>ACADEMIC DESK</Badge>}
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={refresh}
            isLoading={loading}
          >
            Refresh Records
          </Button>
        }
      />

      {/* 1. Academic Overview Banner */}
      {overview && (
        <StudentAcademicOverview
          overview={overview}
          totalCredits={totalCredits}
          subjectCount={subjects.length}
        />
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 pt-2">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'subjects'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Enrolled Subjects
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200 font-mono">
            {subjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'timetable'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Weekly Timetable
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white border border-slate-200 font-mono">
            {timetable.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
            activeTab === 'structure'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Academic Structure
        </button>
      </div>

      {/* 3. Tab Content */}
      <div className="pt-2">
        {activeTab === 'subjects' && (
          <StudentSubjectList
            subjects={filteredSubjects}
            totalSubjects={subjects.length}
            availableSemesters={availableSemesters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedSemester={selectedSemester}
            onSemesterChange={setSelectedSemester}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onSelectSubject={fetchSubjectDetails}
          />
        )}

        {activeTab === 'timetable' && (
          <StudentTimetable
            timetable={timetable}
            sectionName={overview?.sectionName}
          />
        )}

        {activeTab === 'structure' && overview && (
          <StudentAcademicStructureCard
            overview={overview}
            subjectCount={subjects.length}
          />
        )}
      </div>

      {/* Subject Details Modal */}
      <StudentSubjectDetailsModal
        isOpen={!!selectedSubject || detailsLoading}
        onClose={clearSelectedSubject}
        subject={selectedSubject}
        loading={detailsLoading}
        error={detailsError}
      />
    </PageContainer>
  );
};
