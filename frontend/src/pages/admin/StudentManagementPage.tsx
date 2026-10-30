import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonTable } from '../../components/common/SkeletonTable';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useAdminStudents } from '../../hooks/useAdminStudents';
import {
  StudentSummary,
  StudentDetails,
  CreateStudentData,
  UpdateStudentData,
} from '../../services/api/adminStudentApi';
import {
  GraduationCap,
  UserPlus,
  Search,
  RefreshCw,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Building2,
  BookOpen,
  Layers,
  Calendar,
  Phone,
  User,
  Shield,
} from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const {
    students,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    departmentFilter,
    programFilter,
    sectionFilter,
    statusFilter,
    referenceData,
    loadingRefData,
    setSearch,
    setDepartmentFilter,
    setProgramFilter,
    setSectionFilter,
    setStatusFilter,
    setPage,
    refresh,
    loadReferenceData,
    createStudent,
    updateStudent,
    updateStatus,
    getStudentDetails,
  } = useAdminStudents(20);

  // Toast State
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Visibility States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  // Active student selections
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status Confirm Action Target
  const [pendingStatusTarget, setPendingStatusTarget] = useState<{
    student: StudentSummary;
    nextStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  } | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Create Student Form State
  const [userCreationMode, setUserCreationMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [createForm, setCreateForm] = useState<CreateStudentData>({
    registerNumber: '',
    rollNumber: '',
    admissionYear: new Date().getFullYear(),
    currentSemester: 1,
    departmentId: 0,
    programId: 0,
    sectionId: undefined,
    createNewUser: true,
    userId: undefined,
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Edit Student Form State
  const [editForm, setEditForm] = useState<UpdateStudentData>({
    registerNumber: '',
    rollNumber: '',
    admissionYear: 2024,
    currentSemester: 1,
    departmentId: 0,
    programId: 0,
    sectionId: undefined,
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  const extractErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const resp = (err as { response?: { data?: { message?: string } } }).response;
      if (resp?.data?.message) {
        return resp.data.message;
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'An unexpected error occurred';
  };

  // Status Badge Mapper
  const renderStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger">Suspended</Badge>;
      case 'INACTIVE':
        return <Badge variant="gray">Inactive</Badge>;
      default:
        return <Badge variant="gray">{status || 'Unknown'}</Badge>;
    }
  };

  // Filtered Programs for Create Form based on selected Department
  const createAvailablePrograms = useMemo(() => {
    if (!referenceData?.programs || !createForm.departmentId) return [];
    return referenceData.programs.filter((p) => p.departmentId === Number(createForm.departmentId));
  }, [referenceData?.programs, createForm.departmentId]);

  // Filtered Sections for Create Form based on selected Program
  const createAvailableSections = useMemo(() => {
    if (!referenceData?.sections || !createForm.programId) return [];
    return referenceData.sections.filter((s) => s.programId === Number(createForm.programId));
  }, [referenceData?.sections, createForm.programId]);

  // Filtered Programs for Edit Form based on selected Department
  const editAvailablePrograms = useMemo(() => {
    if (!referenceData?.programs || !editForm.departmentId) return [];
    return referenceData.programs.filter((p) => p.departmentId === Number(editForm.departmentId));
  }, [referenceData?.programs, editForm.departmentId]);

  // Filtered Sections for Edit Form based on selected Program
  const editAvailableSections = useMemo(() => {
    if (!referenceData?.sections || !editForm.programId) return [];
    return referenceData.sections.filter((s) => s.programId === Number(editForm.programId));
  }, [referenceData?.sections, editForm.programId]);

  // Filtered Programs for Toolbar Filter based on toolbar Department
  const filterAvailablePrograms = useMemo(() => {
    if (!referenceData?.programs || departmentFilter === 'ALL') return referenceData?.programs || [];
    return referenceData.programs.filter((p) => p.departmentId === Number(departmentFilter));
  }, [referenceData?.programs, departmentFilter]);

  // Filtered Sections for Toolbar Filter based on toolbar Program
  const filterAvailableSections = useMemo(() => {
    if (!referenceData?.sections || programFilter === 'ALL') return referenceData?.sections || [];
    return referenceData.sections.filter((s) => s.programId === Number(programFilter));
  }, [referenceData?.sections, programFilter]);

  // Handlers
  const handleOpenCreateModal = () => {
    loadReferenceData();
    setUserCreationMode('NEW');
    setCreateForm({
      registerNumber: '',
      rollNumber: '',
      admissionYear: new Date().getFullYear(),
      currentSemester: 1,
      departmentId: referenceData?.departments?.[0]?.id || 0,
      programId: 0,
      sectionId: undefined,
      createNewUser: true,
      userId: undefined,
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.departmentId || !createForm.programId) {
      showToast('Please select both Department and Program', 'error');
      return;
    }
    if (userCreationMode === 'EXISTING' && !createForm.userId) {
      showToast('Please choose an existing student user to link', 'error');
      return;
    }

    setIsSubmittingAction(true);
    try {
      const payload: CreateStudentData = {
        ...createForm,
        createNewUser: userCreationMode === 'NEW',
        userId: userCreationMode === 'EXISTING' ? Number(createForm.userId) : undefined,
        departmentId: Number(createForm.departmentId),
        programId: Number(createForm.programId),
        sectionId: createForm.sectionId ? Number(createForm.sectionId) : undefined,
      };

      const created = await createStudent(payload);
      showToast(`Student record ${created.registerNumber} created successfully`);
      setIsCreateModalOpen(false);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenEditModal = (student: StudentSummary) => {
    loadReferenceData();
    setSelectedStudent(student);
    setEditForm({
      registerNumber: student.registerNumber,
      rollNumber: student.rollNumber || '',
      admissionYear: student.admissionYear,
      currentSemester: student.currentSemester,
      departmentId: student.departmentId,
      programId: student.programId,
      sectionId: student.sectionId || undefined,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!editForm.departmentId || !editForm.programId) {
      showToast('Please select both Department and Program', 'error');
      return;
    }

    setIsSubmittingAction(true);
    try {
      const payload: UpdateStudentData = {
        ...editForm,
        departmentId: Number(editForm.departmentId),
        programId: Number(editForm.programId),
        sectionId: editForm.sectionId ? Number(editForm.sectionId) : undefined,
      };

      const updated = await updateStudent(selectedStudent.id, payload);
      showToast(`Student ${updated.registerNumber} updated successfully`);
      setIsEditModalOpen(false);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenDetails = async (student: StudentSummary) => {
    setSelectedStudent(student);
    setStudentDetails(null);
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);
    try {
      const details = await getStudentDetails(student.id);
      setStudentDetails(details);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenStatusConfirm = (
    student: StudentSummary,
    nextStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ) => {
    setPendingStatusTarget({ student, nextStatus });
    setIsStatusConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusTarget) return;
    setIsSubmittingAction(true);
    try {
      await updateStatus(pendingStatusTarget.student.id, pendingStatusTarget.nextStatus);
      showToast(
        `Student ${pendingStatusTarget.student.registerNumber} status set to ${pendingStatusTarget.nextStatus}`
      );
      setIsStatusConfirmOpen(false);
      setPendingStatusTarget(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const isFiltersActive =
    search.trim() !== '' ||
    departmentFilter !== 'ALL' ||
    programFilter !== 'ALL' ||
    sectionFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  const clearAllFilters = () => {
    setSearch('');
    setDepartmentFilter('ALL');
    setProgramFilter('ALL');
    setSectionFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all border bg-white text-sm animate-in fade-in slide-in-from-top-4 border-white/10">
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-gray-200">{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-gray-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Admin</span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-bold">
              Student Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Manage student academic records, enrollment information and academic assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            isLoading={loading || loadingRefData}
            className="flex items-center gap-1.5"
            title="Refresh student list from database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-bold">
              Total Students
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalElements}</div>
          <div className="text-[11px] text-gray-400 mt-1">Institutional academic records</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-bold">
              Active (Current Page)
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {students.filter((s) => s.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">In good academic standing</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-bold">
              Inactive / Suspended
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-300">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            {students.filter((s) => s.status === 'INACTIVE' || s.status === 'SUSPENDED').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Dormant or restricted</div>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-bold">
              Academic Departments
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-300">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-400">
            {referenceData?.departments?.length || 0}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Available academic tracks</div>
        </Card>
      </div>

      {/* Toolbar: Search, Multi-Level Filters, Clear */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by register no, name, username, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">All Departments</option>
              {referenceData?.departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">All Programs</option>
              {filterAvailablePrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} ({p.degreeType})
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">All Sections</option>
              {filterAvailableSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
          </div>

          {/* Status & Clear Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>

            {isFiltersActive && (
              <Button
                variant="ghost"
                size="xs"
                onClick={clearAllFilters}
                className="text-gray-400 hover:text-white shrink-0"
                title="Clear all filters"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error State Alert */}
      {error && (
        <ErrorMessage
          type="error"
          title="Failed to Load Student Records"
          message={error}
          onDismiss={() => refresh()}
        />
      )}

      {/* Student Table Card */}
      <Card className="overflow-hidden bg-white border-slate-200">
        {loading && students.length === 0 ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={8} />
          </div>
        ) : students.length === 0 ? (
          <div className="p-8">
            <EmptyState
              preset="no-students"
              title="No students found"
              description={
                isFiltersActive
                  ? 'No student records match your query and filter parameters. Try resetting filters.'
                  : 'No student academic records are currently provisioned in the system.'
              }
              actionLabel={isFiltersActive ? 'Clear Filters' : 'Add Student'}
              onAction={isFiltersActive ? clearAllFilters : handleOpenCreateModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-50 text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Register Number</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Program</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Student Name & Roll Number */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-100 flex items-center gap-1.5">
                        <span>{student.studentName || `${student.firstName} ${student.lastName}`}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-slate-500 font-medium">@{student.username}</span>
                        {student.rollNumber && (
                          <span className="text-slate-500 font-medium">· Roll: {student.rollNumber}</span>
                        )}
                      </div>
                    </td>

                    {/* Register Number */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-medium text-teal-400">
                        {student.registerNumber}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-medium flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500 font-medium shrink-0" />
                        <span className="truncate max-w-[170px]">{student.email}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 font-medium">{student.departmentCode}</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                        {student.departmentName}
                      </div>
                    </td>

                    {/* Program */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-medium truncate max-w-[160px]">
                        {student.programName}
                      </div>
                    </td>

                    {/* Semester & Batch */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium font-medium">Sem {student.currentSemester}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Adm {student.admissionYear}</div>
                    </td>

                    {/* Section */}
                    <td className="py-3.5 px-4">
                      {student.sectionName ? (
                        <Badge variant="teal">{student.sectionName}</Badge>
                      ) : (
                        <span className="text-slate-500 font-medium text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{renderStatusBadge(student.status)}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(student)}
                          title="View Complete Academic & Account Details"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-white/5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Student */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(student)}
                          title="Edit Student Academic Record"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-teal-300 border border-white/5 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Status Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus =
                              student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                            handleOpenStatusConfirm(student, nextStatus);
                          }}
                          title={
                            student.status === 'ACTIVE'
                              ? 'Deactivate Student Record'
                              : 'Reactivate Student Record'
                          }
                          className={`p-1.5 rounded-lg border transition-colors ${
                            student.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {student.status === 'ACTIVE' ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-white/5 bg-slate-50">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              totalRecords={totalElements}
              pageSize={size}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD STUDENT                                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision Student Academic Record"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <p className="text-xs text-gray-400">
            Create an official student academic record. Associate the record with an institutional
            department, degree program, and section.
          </p>

          {/* Academic Information Section */}
          <div className="border border-white/5 rounded-xl p-3.5 bg-slate-50/60 space-y-3">
            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Academic Structure</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Register Number (Unique)"
                placeholder="e.g. 23CS001"
                value={createForm.registerNumber}
                onChange={(e) =>
                  setCreateForm({ ...createForm, registerNumber: e.target.value.toUpperCase() })
                }
                required
              />
              <Input
                label="Roll Number (Optional)"
                placeholder="e.g. CSE-01"
                value={createForm.rollNumber || ''}
                onChange={(e) => setCreateForm({ ...createForm, rollNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  value={createForm.departmentId}
                  onChange={(e) => {
                    const deptId = Number(e.target.value);
                    setCreateForm({
                      ...createForm,
                      departmentId: deptId,
                      programId: 0,
                      sectionId: undefined,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                  required
                >
                  <option value={0}>Select Department...</option>
                  {referenceData?.departments?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Program / Degree <span className="text-rose-400">*</span>
                </label>
                <select
                  value={createForm.programId}
                  disabled={!createForm.departmentId}
                  onChange={(e) => {
                    const progId = Number(e.target.value);
                    setCreateForm({
                      ...createForm,
                      programId: progId,
                      sectionId: undefined,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                  required
                >
                  <option value={0}>Select Program...</option>
                  {createAvailablePrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Section</label>
                <select
                  value={createForm.sectionId || ''}
                  disabled={!createForm.programId}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      sectionId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                >
                  <option value="">None / Unassigned</option>
                  {createAvailableSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Sem {s.semester})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Admission Year"
                type="number"
                min={2000}
                max={2030}
                value={createForm.admissionYear}
                onChange={(e) =>
                  setCreateForm({ ...createForm, admissionYear: Number(e.target.value) })
                }
                required
              />
              <Input
                label="Current Semester"
                type="number"
                min={1}
                max={12}
                value={createForm.currentSemester}
                onChange={(e) =>
                  setCreateForm({ ...createForm, currentSemester: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>

          {/* User Account Association Section */}
          <div className="border border-white/5 rounded-xl p-3.5 bg-slate-50/60 space-y-3">
            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>User Account Link</span>
              </span>

              <div className="flex items-center gap-4 text-xs font-normal normal-case">
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                  <input
                    type="radio"
                    name="userCreationMode"
                    checked={userCreationMode === 'NEW'}
                    onChange={() => setUserCreationMode('NEW')}
                    className="accent-teal-500"
                  />
                  <span>Provision New User</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                  <input
                    type="radio"
                    name="userCreationMode"
                    checked={userCreationMode === 'EXISTING'}
                    onChange={() => setUserCreationMode('EXISTING')}
                    className="accent-teal-500"
                  />
                  <span>Link Existing Student User</span>
                </label>
              </div>
            </div>

            {userCreationMode === 'NEW' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    placeholder="e.g. Rachel"
                    value={createForm.firstName || ''}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="e.g. Green"
                    value={createForm.lastName || ''}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Username"
                    placeholder="e.g. rachel_green"
                    value={createForm.username || ''}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="e.g. rachel@ahrao.edu"
                    value={createForm.email || ''}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={createForm.password || ''}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone (Optional)"
                    placeholder="e.g. +91 98765 43210"
                    value={createForm.phone || ''}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Select Unassigned Student User <span className="text-rose-400">*</span>
                </label>
                <select
                  value={createForm.userId || ''}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      userId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                  required
                >
                  <option value="">Choose an existing STUDENT account...</option>
                  {referenceData?.unassignedUsers && referenceData.unassignedUsers.length > 0 ? (
                    referenceData.unassignedUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        @{u.username} — {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      No unassigned student accounts found in database
                    </option>
                  )}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Only users with the STUDENT role who are not currently associated with a student
                  record are displayed.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmittingAction}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingAction}>
              Create Student Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT STUDENT                                                     */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Student: ${selectedStudent.registerNumber}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="border border-white/5 rounded-xl p-3.5 bg-slate-50/60 space-y-3">
              <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Academic Information</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Register Number"
                  value={editForm.registerNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, registerNumber: e.target.value.toUpperCase() })
                  }
                  required
                />
                <Input
                  label="Roll Number"
                  value={editForm.rollNumber || ''}
                  onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Department</label>
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => {
                      const deptId = Number(e.target.value);
                      setEditForm({
                        ...editForm,
                        departmentId: deptId,
                        programId: 0,
                        sectionId: undefined,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
                    required
                  >
                    {referenceData?.departments?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Program</label>
                  <select
                    value={editForm.programId}
                    disabled={!editForm.departmentId}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        programId: Number(e.target.value),
                        sectionId: undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                    required
                  >
                    <option value={0}>Select Program...</option>
                    {editAvailablePrograms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Section</label>
                  <select
                    value={editForm.sectionId || ''}
                    disabled={!editForm.programId}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        sectionId: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                  >
                    <option value="">None / Unassigned</option>
                    {editAvailableSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Sem {s.semester})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Admission Year"
                  type="number"
                  value={editForm.admissionYear}
                  onChange={(e) =>
                    setEditForm({ ...editForm, admissionYear: Number(e.target.value) })
                  }
                  required
                />
                <Input
                  label="Current Semester"
                  type="number"
                  min={1}
                  max={12}
                  value={editForm.currentSemester}
                  onChange={(e) =>
                    setEditForm({ ...editForm, currentSemester: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="border border-white/5 rounded-xl p-3.5 bg-slate-50/60 space-y-3">
              <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Personal & Account Information</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={editForm.firstName || ''}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={editForm.lastName || ''}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Institutional Email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingAction}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STUDENT DETAILS VIEW                                             */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Student Profile: ${selectedStudent.registerNumber}`}
          maxWidth="lg"
        >
          {loadingDetails ? (
            <div className="py-8 text-center text-xs text-gray-400">Loading student profile...</div>
          ) : studentDetails ? (
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="p-4 rounded-xl bg-slate-50 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg">
                    {studentDetails.firstName?.[0] || 'S'}
                    {studentDetails.lastName?.[0] || ''}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {studentDetails.firstName} {studentDetails.lastName}
                    </h3>
                    <div className="text-xs text-teal-400 font-mono">
                      {studentDetails.registerNumber}
                      {studentDetails.rollNumber && ` · Roll: ${studentDetails.rollNumber}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusBadge(studentDetails.status)}
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    Sem {studentDetails.currentSemester}
                  </span>
                </div>
              </div>

              {/* Grid 2-column breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Information */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-white/5 space-y-2.5">
                  <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Academic Allocation</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Department</span>
                      <span className="text-white font-medium">
                        {studentDetails.departmentCode} - {studentDetails.departmentName}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Program</span>
                      <span className="text-white font-medium">{studentDetails.programName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Section</span>
                      <span className="text-white font-medium">
                        {studentDetails.sectionName || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Admission Year</span>
                      <span className="text-white font-medium">{studentDetails.admissionYear}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Current Semester</span>
                      <span className="text-white font-medium">
                        Semester {studentDetails.currentSemester}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account & User Identity */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-white/5 space-y-2.5">
                  <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Account Identity</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Username</span>
                      <span className="text-teal-400 font-mono">@{studentDetails.username}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white">{studentDetails.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Phone</span>
                      <span className="text-white">{studentDetails.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Account Status</span>
                      <span className="text-white">{studentDetails.userStatus}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Roles</span>
                      <span className="text-teal-300 font-mono">
                        {studentDetails.roles?.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Timestamps */}
              <div className="p-3 rounded-xl bg-slate-50 border border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                <span>
                  Created:{' '}
                  {studentDetails.createdAt
                    ? new Date(studentDetails.createdAt).toLocaleString()
                    : 'N/A'}
                </span>
                <span>
                  Last Updated:{' '}
                  {studentDetails.updatedAt
                    ? new Date(studentDetails.updatedAt).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-rose-400">
              Failed to load student details.
            </div>
          )}

          <div className="pt-3 flex items-center justify-end border-t border-white/5">
            <Button variant="outline" size="sm" onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM DIALOG: STATUS TOGGLE                                             */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        title={`${pendingStatusTarget?.nextStatus === 'ACTIVE' ? 'Reactivate' : 'Deactivate'} Student Record?`}
        description={`Are you sure you want to change the status of ${pendingStatusTarget?.student?.registerNumber} (${pendingStatusTarget?.student?.studentName || `${pendingStatusTarget?.student?.firstName} ${pendingStatusTarget?.student?.lastName}`}) to ${pendingStatusTarget?.nextStatus}?`}
        confirmText={pendingStatusTarget?.nextStatus === 'ACTIVE' ? 'Reactivate' : 'Deactivate'}
        variant={pendingStatusTarget?.nextStatus === 'ACTIVE' ? 'primary' : 'danger'}
        isLoading={isSubmittingAction}
        onConfirm={handleConfirmStatusChange}
        onClose={() => {
          setIsStatusConfirmOpen(false);
          setPendingStatusTarget(null);
        }}
      />
    </div>
  );
};
