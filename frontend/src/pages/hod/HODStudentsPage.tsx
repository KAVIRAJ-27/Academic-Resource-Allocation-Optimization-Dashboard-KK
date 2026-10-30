import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useHodStudents } from '../../hooks/useHodStudents';
import {
  HodStudentKpiCards,
  HodStudentTable,
  HodStudentDetailModal,
  HodEditStudentModal,
  HodChangeStudentStatusModal,
} from '../../components/hod/students';
import { HodStudentSummary, HodUpdateStudentRequest } from '../../types/hod';
import { GraduationCap, RefreshCw } from 'lucide-react';

export const HODStudentsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const {
    students,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    programFilter,
    sectionFilter,
    semesterFilter,
    referenceData,
    selectedStudent,
    setSearch,
    setStatusFilter,
    setProgramFilter,
    setSectionFilter,
    setSemesterFilter,
    setPage,
    refresh,
    updateStatus,
    updateProfile,
    viewStudentDetail,
    closeStudentDetail,
  } = useHodStudents(10);

  const [editingStudent, setEditingStudent] = useState<HodStudentSummary | null>(null);
  const [statusStudent, setStatusStudent] = useState<HodStudentSummary | null>(null);

  // Compute live KPIs
  const activeCount = students.filter((s) => s.status === 'ACTIVE').length;
  const programsCount = referenceData?.programs?.length || 0;
  const sectionsCount = referenceData?.sections?.length || 0;

  const handleEditSave = async (id: number, data: HodUpdateStudentRequest) => {
    try {
      await updateProfile(id, data);
      success('Student academic placement updated successfully');
      setEditingStudent(null);
    } catch (err: any) {
      toastError(err.message || 'Failed to update student academic record');
      throw err;
    }
  };

  const handleStatusChange = async (
    id: number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING',
    reason?: string
  ) => {
    try {
      await updateStatus(id, status, reason);
      success(`Student enrollment status changed to ${status}`);
      setStatusStudent(null);
    } catch (err: any) {
      toastError(err.message || 'Failed to update student status');
      throw err;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Department Student Management
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Roster, cohort section placements, degree programs, and academic enrollment status
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            isLoading={loading}
            className="border-gray-800 text-gray-300 hover:text-white self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Student Management Error">
            <div className="space-y-3">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={refresh}>
                Retry Loading
              </Button>
            </div>
          </Alert>
        )}

        {/* 4 KPI Summary Cards */}
        <HodStudentKpiCards
          totalStudents={totalElements}
          activeStudents={activeCount}
          programsCount={programsCount}
          sectionsCount={sectionsCount}
        />

        {/* Student Table with Dependent Filters & Pagination */}
        <HodStudentTable
          students={students}
          loading={loading}
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          search={search}
          statusFilter={statusFilter}
          programFilter={programFilter}
          sectionFilter={sectionFilter}
          semesterFilter={semesterFilter}
          referenceData={referenceData}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onProgramFilterChange={setProgramFilter}
          onSectionFilterChange={setSectionFilter}
          onSemesterFilterChange={setSemesterFilter}
          onPageChange={setPage}
          onRefresh={refresh}
          onViewDetails={viewStudentDetail}
          onEdit={(s) => setEditingStudent(s)}
          onChangeStatus={(s) => setStatusStudent(s)}
        />

        {/* View Details Modal */}
        <HodStudentDetailModal
          student={selectedStudent}
          isOpen={selectedStudent !== null}
          onClose={closeStudentDetail}
          onEdit={() => {
            if (selectedStudent) {
              const summaryItem = students.find((s) => s.id === selectedStudent.id) || null;
              closeStudentDetail();
              setEditingStudent(summaryItem);
            }
          }}
        />

        {/* Edit Placement Modal */}
        <HodEditStudentModal
          student={editingStudent}
          referenceData={referenceData}
          isOpen={editingStudent !== null}
          onClose={() => setEditingStudent(null)}
          onSave={handleEditSave}
        />

        {/* Change Status Modal */}
        <HodChangeStudentStatusModal
          student={statusStudent}
          isOpen={statusStudent !== null}
          onClose={() => setStatusStudent(null)}
          onStatusChange={handleStatusChange}
        />
      </div>
    </PageContainer>
  );
};
