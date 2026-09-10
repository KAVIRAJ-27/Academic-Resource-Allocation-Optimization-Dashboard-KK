import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useHodFaculty } from '../../hooks/useHodFaculty';
import {
  HodFacultyKpiCards,
  HodFacultyTable,
  HodFacultyDetailModal,
  HodEditFacultyModal,
  HodChangeFacultyStatusModal,
} from '../../components/hod/faculty';
import { HodFacultySummary, HodUpdateFacultyRequest } from '../../types/hod';
import { Users, RefreshCw } from 'lucide-react';

export const HODFacultyPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const {
    faculty,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    selectedFaculty,
    setSearch,
    setStatusFilter,
    setPage,
    refresh,
    updateStatus,
    updateProfile,
    viewFacultyDetail,
    closeFacultyDetail,
  } = useHodFaculty(10);

  const [editingFaculty, setEditingFaculty] = useState<HodFacultySummary | null>(null);
  const [statusFaculty, setStatusFaculty] = useState<HodFacultySummary | null>(null);

  // Compute live KPIs from loaded set & page metadata
  const activeCount = faculty.filter((f) => f.status === 'ACTIVE').length;
  const totalCourses = faculty.reduce((sum, f) => sum + (f.assignedSubjectsCount || 0), 0);
  const avgHours =
    faculty.length > 0
      ? faculty.reduce((sum, f) => sum + (Number(f.totalWorkloadHours) || 0), 0) / faculty.length
      : 0;

  const handleEditSave = async (id: number, data: HodUpdateFacultyRequest) => {
    try {
      await updateProfile(id, data);
      success('Faculty profile updated successfully');
      setEditingFaculty(null);
    } catch (err: any) {
      toastError(err.message || 'Failed to update faculty profile');
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
      success(`Faculty status changed to ${status}`);
      setStatusFaculty(null);
    } catch (err: any) {
      toastError(err.message || 'Failed to update status');
      throw err;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Department Faculty Management
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage teaching faculty, course allocations, workload, and account statuses
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
          <Alert variant="error" title="Faculty Management Error">
            <div className="space-y-3">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={refresh}>
                Retry Loading
              </Button>
            </div>
          </Alert>
        )}

        {/* 4 KPI Summary Cards */}
        <HodFacultyKpiCards
          totalFaculty={totalElements}
          activeFaculty={activeCount}
          totalCoursesAssigned={totalCourses}
          avgTeachingHours={avgHours}
        />

        {/* Faculty Table with Search, Filter & Pagination */}
        <HodFacultyTable
          faculty={faculty}
          loading={loading}
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onPageChange={setPage}
          onRefresh={refresh}
          onViewDetails={viewFacultyDetail}
          onEdit={(f) => setEditingFaculty(f)}
          onChangeStatus={(f) => setStatusFaculty(f)}
        />

        {/* View Details Modal */}
        <HodFacultyDetailModal
          faculty={selectedFaculty}
          isOpen={selectedFaculty !== null}
          onClose={closeFacultyDetail}
          onEdit={() => {
            if (selectedFaculty) {
              const summaryItem = faculty.find((f) => f.id === selectedFaculty.id) || null;
              closeFacultyDetail();
              setEditingFaculty(summaryItem);
            }
          }}
        />

        {/* Edit Faculty Modal */}
        <HodEditFacultyModal
          faculty={editingFaculty}
          isOpen={editingFaculty !== null}
          onClose={() => setEditingFaculty(null)}
          onSave={handleEditSave}
        />

        {/* Change Status Modal */}
        <HodChangeFacultyStatusModal
          faculty={statusFaculty}
          isOpen={statusFaculty !== null}
          onClose={() => setStatusFaculty(null)}
          onStatusChange={handleStatusChange}
        />
      </div>
    </PageContainer>
  );
};
