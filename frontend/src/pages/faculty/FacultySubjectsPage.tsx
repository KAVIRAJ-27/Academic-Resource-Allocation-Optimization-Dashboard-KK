import React from 'react';
import { PageContainer, PageHeader } from '../../components/layout';
import { Alert, Button, Pagination } from '../../components/ui';
import {
  FacultyAcademicNavTabs,
  FacultySubjectFilters,
  FacultySubjectTable,
  FacultyAcademicSkeleton,
} from '../../components/faculty/academic';
import { useFacultySubjects } from '../../hooks/useFacultySubjects';
import { useFacultyAcademics } from '../../hooks/useFacultyAcademics';
import { RefreshCw } from 'lucide-react';

export const FacultySubjectsPage: React.FC = () => {
  const {
    subjects,
    loading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    search,
    setSearch,
    programId,
    setProgramId,
    semester,
    setSemester,
    resetFilters,
    refresh,
  } = useFacultySubjects(10);

  const { courses } = useFacultyAcademics();

  if (loading && subjects.length === 0) {
    return (
      <PageContainer>
        <FacultyAcademicSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Assigned Subjects"
        description="Curriculum subjects, practical laboratories, and class divisions assigned to your teaching scope"
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="border-[#1E2330] text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Nav Tabs */}
      <FacultyAcademicNavTabs
        subjectsCount={totalElements}
      />

      {error && (
        <Alert variant="error" title="Subject Allocation Notice" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <FacultySubjectFilters
        search={search}
        onSearchChange={setSearch}
        programId={programId}
        onProgramChange={setProgramId}
        semester={semester}
        onSemesterChange={setSemester}
        availablePrograms={courses}
        onReset={resetFilters}
      />

      {/* Subjects Table */}
      <FacultySubjectTable subjects={subjects} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-end">
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}
    </PageContainer>
  );
};
