import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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

// API & Hooks
import {
  DepartmentSummary,
  DepartmentDetails,
  AcademicYearSummary,
  AcademicYearDetails,
  SemesterSummary,
  SemesterDetails,
  ProgramSummary,
  ProgramDetails,
  SubjectSummary,
  SubjectDetails,
  SectionSummary,
  SectionDetails
} from '../../services/api/adminAcademicApi';
import {
  useAdminInstitution,
  useAcademicReferenceData,
  useAdminDepartments,
  useAdminAcademicYears,
  useAdminSemesters,
  useAdminPrograms,
  useAdminSubjects,
  useAdminSections
} from '../../hooks/useAdminAcademic';

// Icons
import {
  Building2,
  Calendar,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Layers,
  Search,
  RefreshCw,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  Building,
  School,
  FileText,
  Clock,
  Users,
  Info,
  Sparkles
} from 'lucide-react';

export type AcademicTab =
  | 'institution'
  | 'departments'
  | 'years'
  | 'semesters'
  | 'programs'
  | 'subjects'
  | 'sections';

interface AcademicManagementPageProps {
  initialTab?: AcademicTab;
}

export const AcademicManagementPage: React.FC<AcademicManagementPageProps> = ({
  initialTab = 'departments'
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as AcademicTab | null;
  const [activeTab, setActiveTab] = useState<AcademicTab>(urlTab || initialTab);

  // Sync activeTab when query param or initialTab changes
  useEffect(() => {
    if (urlTab && ['institution', 'departments', 'years', 'semesters', 'programs', 'subjects', 'sections'].includes(urlTab)) {
      setActiveTab(urlTab);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [urlTab, initialTab]);

  const handleTabChange = (tab: AcademicTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Shared Reference Data
  const { referenceData, refresh: refreshRefData } = useAcademicReferenceData();

  // Tier Hooks
  const institutionHook = useAdminInstitution();
  const departmentsHook = useAdminDepartments(10);
  const yearsHook = useAdminAcademicYears(10);
  const semestersHook = useAdminSemesters(10);
  const programsHook = useAdminPrograms(10);
  const subjectsHook = useAdminSubjects(10);
  const sectionsHook = useAdminSections(10);

  // Modals state
  const [showEditInstitutionModal, setShowEditInstitutionModal] = useState(false);
  const [institutionForm, setInstitutionForm] = useState({
    name: '',
    code: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    website: ''
  });

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' });
  const [selectedDeptDetails, setSelectedDeptDetails] = useState<DepartmentDetails | null>(null);

  // Academic Year Modal State
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingYearId, setEditingYearId] = useState<number | null>(null);
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' });
  const [selectedYearDetails, setSelectedYearDetails] = useState<AcademicYearDetails | null>(null);

  // Semester Modal State
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState<number | null>(null);
  const [semesterForm, setSemesterForm] = useState({ academicYearId: 0, semesterNumber: 1, startDate: '', endDate: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' });
  const [selectedSemesterDetails, setSelectedSemesterDetails] = useState<SemesterDetails | null>(null);

  // Program Modal State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [programForm, setProgramForm] = useState({
    departmentId: 0,
    name: '',
    code: '',
    programType: 'UG' as 'UG' | 'PG' | 'DIPLOMA' | 'PHD',
    durationYears: 4,
    totalSemesters: 8,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });
  const [selectedProgramDetails, setSelectedProgramDetails] = useState<ProgramDetails | null>(null);

  // Subject Modal State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    departmentId: 0,
    programId: 0,
    name: '',
    code: '',
    credits: 3,
    semesterNumber: 1,
    type: 'THEORY' as 'THEORY' | 'PRACTICAL' | 'HYBRID',
    weeklyHours: 3,
    requiresLab: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });
  const [selectedSubjectDetails, setSelectedSubjectDetails] = useState<SubjectDetails | null>(null);

  // Section Modal State
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState({
    departmentId: 0,
    programId: 0,
    semesterId: 0,
    name: '',
    capacity: 60,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });
  const [selectedSectionDetails, setSelectedSectionDetails] = useState<SectionDetails | null>(null);

  // General Action Confirmation
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'danger' | 'warning' | 'primary';
    confirmText?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {}
  });

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const clearAlerts = () => {
    setActionError(null);
    setActionSuccess(null);
  };

  // Pre-fill Institution edit
  const openEditInstitution = () => {
    if (institutionHook.institution) {
      setInstitutionForm({
        name: institutionHook.institution.name,
        code: institutionHook.institution.code,
        address: institutionHook.institution.address || '',
        contactEmail: institutionHook.institution.contactEmail || '',
        contactPhone: institutionHook.institution.contactPhone || '',
        website: institutionHook.institution.website || ''
      });
    }
    setShowEditInstitutionModal(true);
  };

  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      await institutionHook.updateInstitution(institutionForm);
      setShowEditInstitutionModal(false);
      setActionSuccess('Institution profile successfully updated');
      refreshRefData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to update institution');
    }
  };

  // Department handlers
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      if (editingDeptId) {
        await departmentsHook.updateDepartment(editingDeptId, deptForm);
        setActionSuccess('Department updated successfully');
      } else {
        await departmentsHook.createDepartment(deptForm);
        setActionSuccess('Department created successfully');
      }
      setShowDeptModal(false);
      refreshRefData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to save department');
    }
  };

  // Academic Year handlers
  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      if (editingYearId) {
        await yearsHook.updateYear(editingYearId, yearForm);
        setActionSuccess('Academic year updated successfully');
      } else {
        await yearsHook.createYear(yearForm);
        setActionSuccess('Academic year created successfully');
      }
      setShowYearModal(false);
      refreshRefData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to save academic year');
    }
  };

  // Semester handlers
  const handleSaveSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      if (editingSemesterId) {
        await semestersHook.updateSemester(editingSemesterId, semesterForm);
        setActionSuccess('Semester updated successfully');
      } else {
        await semestersHook.createSemester(semesterForm);
        setActionSuccess('Semester created successfully');
      }
      setShowSemesterModal(false);
      refreshRefData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to save semester');
    }
  };

  // Program handlers
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      if (editingProgramId) {
        await programsHook.updateProgram(editingProgramId, programForm);
        setActionSuccess('Program updated successfully');
      } else {
        await programsHook.createProgram(programForm);
        setActionSuccess('Program created successfully');
      }
      setShowProgramModal(false);
      refreshRefData();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to save program');
    }
  };

  // Subject handlers
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      if (editingSubjectId) {
        await subjectsHook.updateSubject(editingSubjectId, subjectForm);
        setActionSuccess('Subject updated successfully');
      } else {
        await subjectsHook.createSubject(subjectForm);
        setActionSuccess('Subject created successfully');
      }
      setShowSubjectModal(false);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to save subject');
    }
  };

  // Section handlers
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      if (editingSectionId) {
        await sectionsHook.updateSection(editingSectionId, sectionForm);
        setActionSuccess('Section updated successfully');
      } else {
        await sectionsHook.createSection(sectionForm);
        setActionSuccess('Section created successfully');
      }
      setShowSectionModal(false);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to save section');
    }
  };

  // Cascading helpers
  const activeDepartments = useMemo(() => {
    return referenceData?.departments || [];
  }, [referenceData]);

  const activeProgramsForDept = (deptId: number) => {
    if (!referenceData?.programs) return [];
    if (!deptId) return referenceData.programs;
    return referenceData.programs.filter((p) => p.parentId === deptId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <School className="w-7 h-7 text-teal-400" />
              Academic Structure & Curriculum
            </h1>
            <Badge variant="teal">Master Hierarchy</Badge>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Centrally manage Institution profile, Departments, Academic Terms, Degree Programs, Curricular Subjects, and Class Sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              institutionHook.refresh();
              departmentsHook.refresh();
              yearsHook.refresh();
              semestersHook.refresh();
              programsHook.refresh();
              subjectsHook.refresh();
              sectionsHook.refresh();
              refreshRefData();
            }}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <Building2 className="w-4 h-4 text-teal-400" />
            Departments
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {institutionHook.institution?.totalDepartments ?? departmentsHook.totalElements}
          </p>
        </Card>

        <Card className="p-3 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <GraduationCap className="w-4 h-4 text-purple-400" />
            Programs
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {institutionHook.institution?.totalPrograms ?? programsHook.totalElements}
          </p>
        </Card>

        <Card className="p-3 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            Active Year
          </div>
          <p className="text-sm font-semibold text-teal-300 mt-1 truncate">
            {yearsHook.years.find((y) => y.status === 'ACTIVE')?.name || 'None Active'}
          </p>
        </Card>

        <Card className="p-3 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Subjects
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {subjectsHook.totalElements}
          </p>
        </Card>

        <Card className="p-3 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <Layers className="w-4 h-4 text-emerald-400" />
            Sections
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {sectionsHook.totalElements}
          </p>
        </Card>

        <Card className="p-3 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <Users className="w-4 h-4 text-rose-400" />
            Active Students
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {institutionHook.institution?.totalActiveStudents ?? 0}
          </p>
        </Card>
      </div>

      {/* Action Notification Alerts */}
      {actionError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between text-rose-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-rose-300">
            &times;
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-emerald-400 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            &times;
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-[#1E2330] flex gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'institution', label: 'Institution Profile', icon: School },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'years', label: 'Academic Years', icon: Calendar },
          { id: 'semesters', label: 'Semesters', icon: CalendarDays },
          { id: 'programs', label: 'Programs & Degrees', icon: GraduationCap },
          { id: 'subjects', label: 'Curricular Subjects', icon: BookOpen },
          { id: 'sections', label: 'Class Sections', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as AcademicTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: INSTITUTION PROFILE */}
      {activeTab === 'institution' && (
        <div className="space-y-4">
          {institutionHook.loading && !institutionHook.institution ? (
            <Card className="p-8 text-center text-gray-400 bg-[#11141C] border-[#1E2330]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
              Loading institution profile...
            </Card>
          ) : institutionHook.error ? (
            <ErrorMessage message={institutionHook.error} />
          ) : (
            institutionHook.institution && (
              <Card className="p-6 bg-[#11141C] border-[#1E2330] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2330] pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-card-glow">
                      {institutionHook.institution.code || 'INST'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{institutionHook.institution.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="teal">{institutionHook.institution.code}</Badge>
                        <span className="text-xs text-gray-400">Autonomous Technical Institute</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" onClick={openEditInstitution} className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit Institution
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Email</span>
                    <p className="text-sm font-medium text-gray-200">
                      {institutionHook.institution.contactEmail || '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Phone</span>
                    <p className="text-sm font-medium text-gray-200">
                      {institutionHook.institution.contactPhone || '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Official Website</span>
                    <p className="text-sm font-medium text-teal-400">
                      {institutionHook.institution.website ? (
                        <a href={institutionHook.institution.website} target="_blank" rel="noreferrer" className="underline hover:text-teal-300">
                          {institutionHook.institution.website}
                        </a>
                      ) : (
                        '—'
                      )}
                    </p>
                  </div>

                  <div className="space-y-1 md:col-span-2 lg:col-span-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campus Address</span>
                    <p className="text-sm font-medium text-gray-200">
                      {institutionHook.institution.address || '—'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1E2330] grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-[#0B0D14] rounded-lg border border-[#1E2330]">
                    <span className="text-xs text-gray-400">Departments</span>
                    <p className="text-lg font-bold text-white mt-0.5">{institutionHook.institution.totalDepartments}</p>
                  </div>
                  <div className="p-3 bg-[#0B0D14] rounded-lg border border-[#1E2330]">
                    <span className="text-xs text-gray-400">Programs Offered</span>
                    <p className="text-lg font-bold text-white mt-0.5">{institutionHook.institution.totalPrograms}</p>
                  </div>
                  <div className="p-3 bg-[#0B0D14] rounded-lg border border-[#1E2330]">
                    <span className="text-xs text-gray-400">Appointed Faculty</span>
                    <p className="text-lg font-bold text-white mt-0.5">{institutionHook.institution.totalFaculty}</p>
                  </div>
                  <div className="p-3 bg-[#0B0D14] rounded-lg border border-[#1E2330]">
                    <span className="text-xs text-gray-400">Active Students</span>
                    <p className="text-lg font-bold text-white mt-0.5">{institutionHook.institution.totalActiveStudents}</p>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* TAB CONTENT 2: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-3 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name or code..."
                  value={departmentsHook.search}
                  onChange={(e) => departmentsHook.setSearch(e.target.value)}
                  className="pl-9 bg-[#0B0D14] border-[#1E2330] text-sm h-9"
                />
              </div>

              <Select
                value={departmentsHook.statusFilter}
                onChange={(e) => departmentsHook.setStatusFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingDeptId(null);
                setDeptForm({ name: '', code: '', description: '', status: 'ACTIVE' });
                setShowDeptModal(true);
              }}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </Button>
          </div>

          {/* Table */}
          {departmentsHook.loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : departmentsHook.departments.length === 0 ? (
            <EmptyState
              title="No departments found"
              description="No academic departments match your search criteria. Create one to begin organizing degree programs."
              actionLabel="Add Department"
              onAction={() => {
                setEditingDeptId(null);
                setDeptForm({ name: '', code: '', description: '', status: 'ACTIVE' });
                setShowDeptModal(true);
              }}
            />
          ) : (
            <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B0D14] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Department Name</th>
                      <th className="py-3 px-4">Head of Dept (HOD)</th>
                      <th className="py-3 px-4 text-center">Programs</th>
                      <th className="py-3 px-4 text-center">Faculty</th>
                      <th className="py-3 px-4 text-center">Students</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-gray-300">
                    {departmentsHook.departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-teal-400">{dept.code}</td>
                        <td className="py-3 px-4 font-medium text-white">{dept.name}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {dept.activeHodName ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-400" />
                              {dept.activeHodName}
                            </span>
                          ) : (
                            <span className="text-gray-500 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{dept.totalPrograms}</td>
                        <td className="py-3 px-4 text-center font-mono">{dept.totalFaculty}</td>
                        <td className="py-3 px-4 text-center font-mono">{dept.totalStudents}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={dept.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                            {dept.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={async () => {
                                const res = await departmentsHook.getDepartmentDetails(dept.id);
                                setSelectedDeptDetails(res.data);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1E2330]"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const res = await departmentsHook.getDepartmentDetails(dept.id);
                                const d = res.data;
                                setEditingDeptId(d.id);
                                setDeptForm({
                                  name: d.name,
                                  code: d.code,
                                  description: d.description || '',
                                  status: d.status
                                });
                                setShowDeptModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-teal-400 rounded hover:bg-[#1E2330]"
                              title="Edit Department"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Department?`,
                                  message: `Are you sure you want to change status of "${dept.name}" (${dept.code}) to ${nextStatus}?`,
                                  variant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
                                  confirmText: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await departmentsHook.changeStatus(dept.id, nextStatus);
                                      setActionSuccess(`Department marked ${nextStatus}`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Status change failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-[#1E2330]"
                              title={dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {dept.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `Delete Department "${dept.code}"?`,
                                  message: `Warning: This action cannot be undone. You cannot delete a department that has linked programs, faculty, students, or rooms.`,
                                  variant: 'danger',
                                  confirmText: 'Delete Department',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await departmentsHook.deleteDepartment(dept.id);
                                      setActionSuccess(`Department ${dept.code} deleted successfully`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Delete failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-[#1E2330]"
                              title="Delete Department"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {departmentsHook.totalPages > 1 && (
                <div className="p-3 border-t border-[#1E2330]">
                  <Pagination
                    currentPage={departmentsHook.page + 1}
                    totalPages={departmentsHook.totalPages}
                    onPageChange={(p) => departmentsHook.setPage(p - 1)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: ACADEMIC YEARS */}
      {activeTab === 'years' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-3 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search year name (e.g. 2026-2027)..."
                  value={yearsHook.search}
                  onChange={(e) => yearsHook.setSearch(e.target.value)}
                  className="pl-9 bg-[#0B0D14] border-[#1E2330] text-sm h-9"
                />
              </div>

              <Select
                value={yearsHook.statusFilter}
                onChange={(e) => yearsHook.setStatusFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingYearId(null);
                setYearForm({ name: '', startDate: '', endDate: '', status: 'INACTIVE' });
                setShowYearModal(true);
              }}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Academic Year
            </Button>
          </div>

          {/* Table */}
          {yearsHook.loading ? (
            <SkeletonTable rows={4} columns={6} />
          ) : yearsHook.years.length === 0 ? (
            <EmptyState
              title="No academic years defined"
              description="Configure academic years (e.g. 2025-2026, 2026-2027) with start and end dates."
              actionLabel="Add Academic Year"
              onAction={() => {
                setEditingYearId(null);
                setYearForm({ name: '', startDate: '', endDate: '', status: 'INACTIVE' });
                setShowYearModal(true);
              }}
            />
          ) : (
            <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B0D14] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Academic Year</th>
                      <th className="py-3 px-4">Start Date</th>
                      <th className="py-3 px-4">End Date</th>
                      <th className="py-3 px-4 text-center">Semesters</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-gray-300">
                    {yearsHook.years.map((year) => (
                      <tr key={year.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="py-3 px-4 font-medium text-white font-mono">{year.name}</td>
                        <td className="py-3 px-4 text-gray-300">{year.startDate}</td>
                        <td className="py-3 px-4 text-gray-300">{year.endDate}</td>
                        <td className="py-3 px-4 text-center font-mono">{year.totalSemesters}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={year.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                            {year.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {year.status !== 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => {
                                  setConfirmConfig({
                                    isOpen: true,
                                    title: `Activate Academic Year "${year.name}"?`,
                                    message: `Activating "${year.name}" will automatically deactivate any currently active academic year across the entire institution. Proceed?`,
                                    variant: 'primary',
                                    confirmText: 'Activate Now',
                                    onConfirm: async () => {
                                      clearAlerts();
                                      try {
                                        await yearsHook.activateYear(year.id);
                                        setActionSuccess(`Academic Year ${year.name} is now ACTIVE`);
                                      } catch (err: any) {
                                        setActionError(err?.response?.data?.message || err?.message || 'Activation failed');
                                      }
                                    }
                                  });
                                }}
                                className="text-teal-400 border-teal-500/30 hover:bg-teal-500/10 text-xs px-2 py-1"
                              >
                                Activate
                              </Button>
                            )}
                            <button
                              onClick={async () => {
                                const res = await yearsHook.getYearDetails(year.id);
                                setSelectedYearDetails(res.data);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1E2330]"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const res = await yearsHook.getYearDetails(year.id);
                                const y = res.data;
                                setEditingYearId(y.id);
                                setYearForm({
                                  name: y.name,
                                  startDate: y.startDate,
                                  endDate: y.endDate,
                                  status: y.status
                                });
                                setShowYearModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-teal-400 rounded hover:bg-[#1E2330]"
                              title="Edit Academic Year"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `Delete Academic Year "${year.name}"?`,
                                  message: `Warning: This action cannot be undone. An academic year with existing semesters or allocations cannot be deleted.`,
                                  variant: 'danger',
                                  confirmText: 'Delete Year',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await yearsHook.deleteYear(year.id);
                                      setActionSuccess(`Academic Year ${year.name} deleted successfully`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Delete failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-[#1E2330]"
                              title="Delete Year"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {yearsHook.totalPages > 1 && (
                <div className="p-3 border-t border-[#1E2330]">
                  <Pagination
                    currentPage={yearsHook.page + 1}
                    totalPages={yearsHook.totalPages}
                    onPageChange={(p) => yearsHook.setPage(p - 1)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: SEMESTERS */}
      {activeTab === 'semesters' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-3 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <Select
                value={semestersHook.academicYearFilter}
                onChange={(e) => semestersHook.setAcademicYearFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-44"
              >
                <option value="ALL">All Academic Years</option>
                {referenceData?.academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.status === 'ACTIVE' ? '(Active)' : ''}
                  </option>
                ))}
              </Select>

              <Select
                value={semestersHook.statusFilter}
                onChange={(e) => semestersHook.setStatusFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingSemesterId(null);
                const defaultYearId = referenceData?.academicYears.find((y) => y.status === 'ACTIVE')?.id || referenceData?.academicYears[0]?.id || 0;
                setSemesterForm({
                  academicYearId: defaultYearId,
                  semesterNumber: 1,
                  startDate: '',
                  endDate: '',
                  status: 'ACTIVE'
                });
                setShowSemesterModal(true);
              }}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Semester
            </Button>
          </div>

          {/* Table */}
          {semestersHook.loading ? (
            <SkeletonTable rows={4} columns={6} />
          ) : semestersHook.semesters.length === 0 ? (
            <EmptyState
              title="No semesters found"
              description="Semesters define the active academic terms (e.g. Semester 1, Semester 2) for an Academic Year."
              actionLabel="Add Semester"
              onAction={() => {
                setEditingSemesterId(null);
                const defaultYearId = referenceData?.academicYears[0]?.id || 0;
                setSemesterForm({
                  academicYearId: defaultYearId,
                  semesterNumber: 1,
                  startDate: '',
                  endDate: '',
                  status: 'ACTIVE'
                });
                setShowSemesterModal(true);
              }}
            />
          ) : (
            <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B0D14] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Academic Year</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Term Dates</th>
                      <th className="py-3 px-4 text-center">Sections</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-gray-300">
                    {semestersHook.semesters.map((sem) => (
                      <tr key={sem.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-white">{sem.academicYearName}</td>
                        <td className="py-3 px-4 font-semibold text-teal-400">
                          Semester {sem.semesterNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {sem.startDate} &rarr; {sem.endDate}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{sem.totalSections}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={sem.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                            {sem.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={async () => {
                                const res = await semestersHook.getSemesterDetails(sem.id);
                                setSelectedSemesterDetails(res.data);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1E2330]"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const res = await semestersHook.getSemesterDetails(sem.id);
                                const s = res.data;
                                setEditingSemesterId(s.id);
                                setSemesterForm({
                                  academicYearId: s.academicYearId,
                                  semesterNumber: s.semesterNumber,
                                  startDate: s.startDate,
                                  endDate: s.endDate,
                                  status: s.status
                                });
                                setShowSemesterModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-teal-400 rounded hover:bg-[#1E2330]"
                              title="Edit Semester"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = sem.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Semester ${sem.semesterNumber}?`,
                                  message: `Change semester status for ${sem.academicYearName} to ${nextStatus}?`,
                                  variant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
                                  confirmText: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await semestersHook.changeStatus(sem.id, nextStatus);
                                      setActionSuccess(`Semester ${sem.semesterNumber} marked ${nextStatus}`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Status change failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-[#1E2330]"
                              title={sem.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {sem.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `Delete Semester ${sem.semesterNumber}?`,
                                  message: `Warning: This action cannot be undone. You cannot delete a semester that has dependent class sections or allocations.`,
                                  variant: 'danger',
                                  confirmText: 'Delete Semester',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await semestersHook.deleteSemester(sem.id);
                                      setActionSuccess(`Semester ${sem.semesterNumber} deleted successfully`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Delete failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-[#1E2330]"
                              title="Delete Semester"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {semestersHook.totalPages > 1 && (
                <div className="p-3 border-t border-[#1E2330]">
                  <Pagination
                    currentPage={semestersHook.page + 1}
                    totalPages={semestersHook.totalPages}
                    onPageChange={(p) => semestersHook.setPage(p - 1)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-3 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search program..."
                  value={programsHook.search}
                  onChange={(e) => programsHook.setSearch(e.target.value)}
                  className="pl-9 bg-[#0B0D14] border-[#1E2330] text-sm h-9"
                />
              </div>

              <Select
                value={programsHook.departmentFilter}
                onChange={(e) => programsHook.setDepartmentFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-44"
              >
                <option value="ALL">All Departments</option>
                {activeDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </Select>

              <Select
                value={programsHook.typeFilter}
                onChange={(e) => programsHook.setTypeFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Degrees</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="PHD">PhD</option>
              </Select>

              <Select
                value={programsHook.statusFilter}
                onChange={(e) => programsHook.setStatusFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingProgramId(null);
                const defaultDeptId = activeDepartments[0]?.id || 0;
                setProgramForm({
                  departmentId: defaultDeptId,
                  name: '',
                  code: '',
                  programType: 'UG',
                  durationYears: 4,
                  totalSemesters: 8,
                  status: 'ACTIVE'
                });
                setShowProgramModal(true);
              }}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Program
            </Button>
          </div>

          {/* Table */}
          {programsHook.loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : programsHook.programs.length === 0 ? (
            <EmptyState
              title="No programs found"
              description="Degree programs (e.g. B.Tech Computer Science, M.Tech AI) belong to departments."
              actionLabel="Add Program"
              onAction={() => {
                setEditingProgramId(null);
                const defaultDeptId = activeDepartments[0]?.id || 0;
                setProgramForm({
                  departmentId: defaultDeptId,
                  name: '',
                  code: '',
                  programType: 'UG',
                  durationYears: 4,
                  totalSemesters: 8,
                  status: 'ACTIVE'
                });
                setShowProgramModal(true);
              }}
            />
          ) : (
            <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B0D14] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Program Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-center">Type</th>
                      <th className="py-3 px-4 text-center">Duration</th>
                      <th className="py-3 px-4 text-center">Students</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-gray-300">
                    {programsHook.programs.map((prog) => (
                      <tr key={prog.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-teal-400">{prog.code}</td>
                        <td className="py-3 px-4 font-medium text-white">{prog.name}</td>
                        <td className="py-3 px-4 text-gray-300">{prog.departmentName}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={prog.programType === 'UG' ? 'teal' : 'purple'}>
                            {prog.programType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-gray-400">
                          {prog.durationYears}y ({prog.totalSemesters} sem)
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{prog.totalStudents}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={prog.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                            {prog.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={async () => {
                                const res = await programsHook.getProgramDetails(prog.id);
                                setSelectedProgramDetails(res.data);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1E2330]"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const res = await programsHook.getProgramDetails(prog.id);
                                const p = res.data;
                                setEditingProgramId(p.id);
                                setProgramForm({
                                  departmentId: p.departmentId,
                                  name: p.name,
                                  code: p.code,
                                  programType: p.programType,
                                  durationYears: p.durationYears,
                                  totalSemesters: p.totalSemesters,
                                  status: p.status
                                });
                                setShowProgramModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-teal-400 rounded hover:bg-[#1E2330]"
                              title="Edit Program"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = prog.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Program "${prog.code}"?`,
                                  message: `Change status of ${prog.name} to ${nextStatus}?`,
                                  variant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
                                  confirmText: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await programsHook.changeStatus(prog.id, nextStatus);
                                      setActionSuccess(`Program marked ${nextStatus}`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Status change failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-[#1E2330]"
                              title={prog.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {prog.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `Delete Program "${prog.code}"?`,
                                  message: `Warning: This action cannot be undone. You cannot delete a program that has enrolled students, assigned subjects, or class sections.`,
                                  variant: 'danger',
                                  confirmText: 'Delete Program',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await programsHook.deleteProgram(prog.id);
                                      setActionSuccess(`Program ${prog.code} deleted successfully`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Delete failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-[#1E2330]"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {programsHook.totalPages > 1 && (
                <div className="p-3 border-t border-[#1E2330]">
                  <Pagination
                    currentPage={programsHook.page + 1}
                    totalPages={programsHook.totalPages}
                    onPageChange={(p) => programsHook.setPage(p - 1)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT 6: SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {/* Controls Bar with Cascades */}
          <div className="flex flex-col gap-3 bg-[#11141C] p-3 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search code or subject..."
                  value={subjectsHook.search}
                  onChange={(e) => subjectsHook.setSearch(e.target.value)}
                  className="pl-9 bg-[#0B0D14] border-[#1E2330] text-sm h-9"
                />
              </div>

              <Select
                value={subjectsHook.departmentFilter}
                onChange={(e) => subjectsHook.setDepartmentFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-44"
              >
                <option value="ALL">All Departments</option>
                {activeDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </Select>

              <Select
                value={subjectsHook.programFilter}
                onChange={(e) => subjectsHook.setProgramFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-44"
              >
                <option value="ALL">All Programs</option>
                {activeProgramsForDept(Number(subjectsHook.departmentFilter)).map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </Select>

              <Select
                value={subjectsHook.semesterNumberFilter}
                onChange={(e) => subjectsHook.setSemesterNumberFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Sem {sem}
                  </option>
                ))}
              </Select>

              <Select
                value={subjectsHook.typeFilter}
                onChange={(e) => subjectsHook.setTypeFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Types</option>
                <option value="THEORY">THEORY</option>
                <option value="PRACTICAL">PRACTICAL</option>
                <option value="HYBRID">HYBRID</option>
              </Select>

              <Select
                value={subjectsHook.statusFilter}
                onChange={(e) => subjectsHook.setStatusFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>

              <div className="ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingSubjectId(null);
                    const defaultDeptId = activeDepartments[0]?.id || 0;
                    const progs = activeProgramsForDept(defaultDeptId);
                    setSubjectForm({
                      departmentId: defaultDeptId,
                      programId: progs[0]?.id || 0,
                      name: '',
                      code: '',
                      credits: 3,
                      semesterNumber: 1,
                      type: 'THEORY',
                      weeklyHours: 3,
                      requiresLab: false,
                      status: 'ACTIVE'
                    });
                    setShowSubjectModal(true);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          {subjectsHook.loading ? (
            <SkeletonTable rows={6} columns={7} />
          ) : subjectsHook.subjects.length === 0 ? (
            <EmptyState
              title="No subjects found"
              description="Subjects define academic curriculum, credits, lecture/lab requirements, and semester alignments."
              actionLabel="Add Subject"
              onAction={() => {
                setEditingSubjectId(null);
                const defaultDeptId = activeDepartments[0]?.id || 0;
                const progs = activeProgramsForDept(defaultDeptId);
                setSubjectForm({
                  departmentId: defaultDeptId,
                  programId: progs[0]?.id || 0,
                  name: '',
                  code: '',
                  credits: 3,
                  semesterNumber: 1,
                  type: 'THEORY',
                  weeklyHours: 3,
                  requiresLab: false,
                  status: 'ACTIVE'
                });
                setShowSubjectModal(true);
              }}
            />
          ) : (
            <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B0D14] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Subject Name</th>
                      <th className="py-3 px-4">Department / Program</th>
                      <th className="py-3 px-4 text-center">Sem</th>
                      <th className="py-3 px-4 text-center">Credits</th>
                      <th className="py-3 px-4 text-center">Type</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-gray-300">
                    {subjectsHook.subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-teal-400">{sub.code}</td>
                        <td className="py-3 px-4 font-medium text-white">{sub.name}</td>
                        <td className="py-3 px-4 text-gray-300">
                          <span className="font-semibold text-gray-200">{sub.departmentCode}</span>
                          <span className="text-gray-500 mx-1">&bull;</span>
                          <span className="text-gray-400 text-xs">{sub.programName}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">Sem {sub.semesterNumber}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-teal-300">{sub.credits}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              sub.type === 'THEORY'
                                ? 'teal'
                                : sub.type === 'PRACTICAL'
                                ? 'purple'
                                : 'blue'
                            }
                          >
                            {sub.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={sub.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={async () => {
                                const res = await subjectsHook.getSubjectDetails(sub.id);
                                setSelectedSubjectDetails(res.data);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1E2330]"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const res = await subjectsHook.getSubjectDetails(sub.id);
                                const s = res.data;
                                setEditingSubjectId(s.id);
                                setSubjectForm({
                                  departmentId: s.departmentId,
                                  programId: s.programId,
                                  name: s.name,
                                  code: s.code,
                                  credits: s.credits,
                                  semesterNumber: s.semesterNumber,
                                  type: s.type,
                                  weeklyHours: s.weeklyHours,
                                  requiresLab: s.requiresLab,
                                  status: s.status
                                });
                                setShowSubjectModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-teal-400 rounded hover:bg-[#1E2330]"
                              title="Edit Subject"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = sub.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Subject "${sub.code}"?`,
                                  message: `Change status of ${sub.name} to ${nextStatus}?`,
                                  variant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
                                  confirmText: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await subjectsHook.changeStatus(sub.id, nextStatus);
                                      setActionSuccess(`Subject marked ${nextStatus}`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Status change failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-[#1E2330]"
                              title={sub.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {sub.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `Delete Subject "${sub.code}"?`,
                                  message: `Warning: This action cannot be undone. You cannot delete a subject that has active allocations or course schedules.`,
                                  variant: 'danger',
                                  confirmText: 'Delete Subject',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await subjectsHook.deleteSubject(sub.id);
                                      setActionSuccess(`Subject ${sub.code} deleted successfully`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Delete failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-[#1E2330]"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {subjectsHook.totalPages > 1 && (
                <div className="p-3 border-t border-[#1E2330]">
                  <Pagination
                    currentPage={subjectsHook.page + 1}
                    totalPages={subjectsHook.totalPages}
                    onPageChange={(p) => subjectsHook.setPage(p - 1)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT 7: SECTIONS */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {/* Controls Bar with Cascades */}
          <div className="flex flex-col gap-3 bg-[#11141C] p-3 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search section name..."
                  value={sectionsHook.search}
                  onChange={(e) => sectionsHook.setSearch(e.target.value)}
                  className="pl-9 bg-[#0B0D14] border-[#1E2330] text-sm h-9"
                />
              </div>

              <Select
                value={sectionsHook.departmentFilter}
                onChange={(e) => sectionsHook.setDepartmentFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-44"
              >
                <option value="ALL">All Departments</option>
                {activeDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </Select>

              <Select
                value={sectionsHook.programFilter}
                onChange={(e) => sectionsHook.setProgramFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-44"
              >
                <option value="ALL">All Programs</option>
                {activeProgramsForDept(Number(sectionsHook.departmentFilter)).map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </Select>

              <Select
                value={sectionsHook.semesterFilter}
                onChange={(e) => sectionsHook.setSemesterFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-40"
              >
                <option value="ALL">All Semesters</option>
                {referenceData?.semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>

              <Select
                value={sectionsHook.statusFilter}
                onChange={(e) => sectionsHook.setStatusFilter(e.target.value)}
                className="bg-[#0B0D14] border-[#1E2330] text-sm h-9 w-32"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>

              <div className="ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingSectionId(null);
                    const defaultDeptId = activeDepartments[0]?.id || 0;
                    const progs = activeProgramsForDept(defaultDeptId);
                    const defaultSemId = referenceData?.semesters[0]?.id || 0;
                    setSectionForm({
                      departmentId: defaultDeptId,
                      programId: progs[0]?.id || 0,
                      semesterId: defaultSemId,
                      name: 'Section A',
                      capacity: 60,
                      status: 'ACTIVE'
                    });
                    setShowSectionModal(true);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          {sectionsHook.loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : sectionsHook.sections.length === 0 ? (
            <EmptyState
              title="No sections found"
              description="Class sections (e.g. Section A, Section B) group students for scheduling, lecture rooms, and labs."
              actionLabel="Add Section"
              onAction={() => {
                setEditingSectionId(null);
                const defaultDeptId = activeDepartments[0]?.id || 0;
                const progs = activeProgramsForDept(defaultDeptId);
                const defaultSemId = referenceData?.semesters[0]?.id || 0;
                setSectionForm({
                  departmentId: defaultDeptId,
                  programId: progs[0]?.id || 0,
                  semesterId: defaultSemId,
                  name: 'Section A',
                  capacity: 60,
                  status: 'ACTIVE'
                });
                setShowSectionModal(true);
              }}
            />
          ) : (
            <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B0D14] border-b border-[#1E2330] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4">Department / Program</th>
                      <th className="py-3 px-4">Semester Term</th>
                      <th className="py-3 px-4 text-center">Capacity</th>
                      <th className="py-3 px-4 text-center">Enrolled Students</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330] text-gray-300">
                    {sectionsHook.sections.map((sec) => (
                      <tr key={sec.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="py-3 px-4 font-medium text-white font-mono">{sec.name}</td>
                        <td className="py-3 px-4 text-gray-300">
                          <span className="font-semibold text-gray-200">{sec.departmentCode}</span>
                          <span className="text-gray-500 mx-1">&bull;</span>
                          <span className="text-gray-400 text-xs">{sec.programName}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-mono text-xs">
                          {sec.academicYearName} - Sem {sec.semesterNumber}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{sec.capacity}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span
                            className={
                              sec.studentCount >= sec.capacity
                                ? 'text-amber-400 font-bold'
                                : 'text-gray-300'
                            }
                          >
                            {sec.studentCount} / {sec.capacity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={sec.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                            {sec.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={async () => {
                                const res = await sectionsHook.getSectionDetails(sec.id);
                                setSelectedSectionDetails(res.data);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#1E2330]"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const res = await sectionsHook.getSectionDetails(sec.id);
                                const s = res.data;
                                setEditingSectionId(s.id);
                                setSectionForm({
                                  departmentId: s.departmentId,
                                  programId: s.programId,
                                  semesterId: s.semesterId,
                                  name: s.name,
                                  capacity: s.capacity,
                                  status: s.status
                                });
                                setShowSectionModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-teal-400 rounded hover:bg-[#1E2330]"
                              title="Edit Section"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const nextStatus = sec.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Section "${sec.name}"?`,
                                  message: `Change status of ${sec.name} to ${nextStatus}?`,
                                  variant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
                                  confirmText: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await sectionsHook.changeStatus(sec.id, nextStatus);
                                      setActionSuccess(`Section marked ${nextStatus}`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Status change failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-[#1E2330]"
                              title={sec.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            >
                              {sec.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => {
                                setConfirmConfig({
                                  isOpen: true,
                                  title: `Delete Section "${sec.name}"?`,
                                  message: `Warning: This action cannot be undone. You cannot delete a section with assigned students or resource allocations.`,
                                  variant: 'danger',
                                  confirmText: 'Delete Section',
                                  onConfirm: async () => {
                                    clearAlerts();
                                    try {
                                      await sectionsHook.deleteSection(sec.id);
                                      setActionSuccess(`Section ${sec.name} deleted successfully`);
                                    } catch (err: any) {
                                      setActionError(err?.response?.data?.message || err?.message || 'Delete failed');
                                    }
                                  }
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-[#1E2330]"
                              title="Delete Section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sectionsHook.totalPages > 1 && (
                <div className="p-3 border-t border-[#1E2330]">
                  <Pagination
                    currentPage={sectionsHook.page + 1}
                    totalPages={sectionsHook.totalPages}
                    onPageChange={(p) => sectionsHook.setPage(p - 1)}
                  />
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS & DIALOGS                                                          */}
      {/* ========================================================================= */}

      {/* 1. EDIT INSTITUTION MODAL */}
      {showEditInstitutionModal && (
        <Modal
          isOpen={showEditInstitutionModal}
          onClose={() => setShowEditInstitutionModal(false)}
          title="Edit Institution Profile"
        >
          <form onSubmit={handleSaveInstitution} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Institution Name *
              </label>
              <Input
                required
                value={institutionForm.name}
                onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                placeholder="e.g. Apex Institute of Technology"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Institution Code *
                </label>
                <Input
                  required
                  value={institutionForm.code}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. AIT"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Contact Phone
                </label>
                <Input
                  value={institutionForm.contactPhone}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, contactPhone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={institutionForm.contactEmail}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, contactEmail: e.target.value })}
                  placeholder="admin@institute.edu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Website URL
                </label>
                <Input
                  value={institutionForm.website}
                  onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                  placeholder="https://institute.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Campus Address
              </label>
              <Input
                value={institutionForm.address}
                onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
                placeholder="Campus Road, Cyber City, State - PIN"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1E2330]">
              <Button type="button" variant="outline" onClick={() => setShowEditInstitutionModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Profile
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. CREATE / EDIT DEPARTMENT MODAL */}
      {showDeptModal && (
        <Modal
          isOpen={showDeptModal}
          onClose={() => setShowDeptModal(false)}
          title={editingDeptId ? 'Edit Department' : 'Create New Department'}
        >
          <form onSubmit={handleSaveDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Department Name *
              </label>
              <Input
                required
                value={deptForm.name}
                onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Department Code *
                </label>
                <Input
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CSE"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Status
                </label>
                <Select
                  value={deptForm.status}
                  onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Description
              </label>
              <Input
                value={deptForm.description}
                onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                placeholder="Department mission and academic scope..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1E2330]">
              <Button type="button" variant="outline" onClick={() => setShowDeptModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingDeptId ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. CREATE / EDIT ACADEMIC YEAR MODAL */}
      {showYearModal && (
        <Modal
          isOpen={showYearModal}
          onClose={() => setShowYearModal(false)}
          title={editingYearId ? 'Edit Academic Year' : 'Create New Academic Year'}
        >
          <form onSubmit={handleSaveYear} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Academic Year Title *
              </label>
              <Input
                required
                value={yearForm.name}
                onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                placeholder="e.g. 2026-2027"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Start Date *
                </label>
                <Input
                  type="date"
                  required
                  value={yearForm.startDate}
                  onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  End Date *
                </label>
                <Input
                  type="date"
                  required
                  value={yearForm.endDate}
                  onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Initial Status
              </label>
              <Select
                value={yearForm.status}
                onChange={(e) => setYearForm({ ...yearForm, status: e.target.value as any })}
              >
                <option value="INACTIVE">INACTIVE</option>
                <option value="ACTIVE">ACTIVE (Sets other years to INACTIVE)</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1E2330]">
              <Button type="button" variant="outline" onClick={() => setShowYearModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingYearId ? 'Update Academic Year' : 'Create Academic Year'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. CREATE / EDIT SEMESTER MODAL */}
      {showSemesterModal && (
        <Modal
          isOpen={showSemesterModal}
          onClose={() => setShowSemesterModal(false)}
          title={editingSemesterId ? 'Edit Semester' : 'Create New Semester'}
        >
          <form onSubmit={handleSaveSemester} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Academic Year *
              </label>
              <Select
                required
                value={semesterForm.academicYearId}
                onChange={(e) => setSemesterForm({ ...semesterForm, academicYearId: Number(e.target.value) })}
              >
                <option value={0}>Select Academic Year...</option>
                {referenceData?.academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} {ay.status === 'ACTIVE' ? '(Active)' : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Semester Number (1-12) *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={semesterForm.semesterNumber}
                  onChange={(e) => setSemesterForm({ ...semesterForm, semesterNumber: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Status
                </label>
                <Select
                  value={semesterForm.status}
                  onChange={(e) => setSemesterForm({ ...semesterForm, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Term Start Date *
                </label>
                <Input
                  type="date"
                  required
                  value={semesterForm.startDate}
                  onChange={(e) => setSemesterForm({ ...semesterForm, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Term End Date *
                </label>
                <Input
                  type="date"
                  required
                  value={semesterForm.endDate}
                  onChange={(e) => setSemesterForm({ ...semesterForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1E2330]">
              <Button type="button" variant="outline" onClick={() => setShowSemesterModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingSemesterId ? 'Update Semester' : 'Create Semester'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. CREATE / EDIT PROGRAM MODAL */}
      {showProgramModal && (
        <Modal
          isOpen={showProgramModal}
          onClose={() => setShowProgramModal(false)}
          title={editingProgramId ? 'Edit Degree Program' : 'Create New Degree Program'}
        >
          <form onSubmit={handleSaveProgram} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Parent Department *
              </label>
              <Select
                required
                value={programForm.departmentId}
                onChange={(e) => setProgramForm({ ...programForm, departmentId: Number(e.target.value) })}
              >
                <option value={0}>Select Department...</option>
                {activeDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Program Title *
              </label>
              <Input
                required
                value={programForm.name}
                onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                placeholder="e.g. Bachelor of Technology in Computer Science"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Program Code *
                </label>
                <Input
                  required
                  value={programForm.code}
                  onChange={(e) => setProgramForm({ ...programForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BTECH-CSE"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Program Level / Degree
                </label>
                <Select
                  value={programForm.programType}
                  onChange={(e) => setProgramForm({ ...programForm, programType: e.target.value as any })}
                >
                  <option value="UG">UG (Undergraduate)</option>
                  <option value="PG">PG (Postgraduate)</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="PHD">Doctorate (PhD)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Duration (Years) *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  required
                  value={programForm.durationYears}
                  onChange={(e) => setProgramForm({ ...programForm, durationYears: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Total Semesters *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={16}
                  required
                  value={programForm.totalSemesters}
                  onChange={(e) => setProgramForm({ ...programForm, totalSemesters: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Status
                </label>
                <Select
                  value={programForm.status}
                  onChange={(e) => setProgramForm({ ...programForm, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1E2330]">
              <Button type="button" variant="outline" onClick={() => setShowProgramModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingProgramId ? 'Update Program' : 'Create Program'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 6. CREATE / EDIT SUBJECT MODAL */}
      {showSubjectModal && (
        <Modal
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          title={editingSubjectId ? 'Edit Curricular Subject' : 'Create New Subject'}
        >
          <form onSubmit={handleSaveSubject} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Department *
                </label>
                <Select
                  required
                  value={subjectForm.departmentId}
                  onChange={(e) => {
                    const deptId = Number(e.target.value);
                    const progs = activeProgramsForDept(deptId);
                    setSubjectForm({
                      ...subjectForm,
                      departmentId: deptId,
                      programId: progs[0]?.id || 0
                    });
                  }}
                >
                  <option value={0}>Select Department...</option>
                  {activeDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Degree Program *
                </label>
                <Select
                  required
                  value={subjectForm.programId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, programId: Number(e.target.value) })}
                >
                  <option value={0}>Select Program...</option>
                  {activeProgramsForDept(subjectForm.departmentId).map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Subject Title *
              </label>
              <Input
                required
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="e.g. Design and Analysis of Algorithms"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Subject Code *
                </label>
                <Input
                  required
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS501"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Semester # *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={subjectForm.semesterNumber}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semesterNumber: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Credits *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={subjectForm.credits}
                  onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Subject Type
                </label>
                <Select
                  value={subjectForm.type}
                  onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value as any })}
                >
                  <option value="THEORY">THEORY</option>
                  <option value="PRACTICAL">PRACTICAL</option>
                  <option value="HYBRID">HYBRID</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Weekly Hours
                </label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={subjectForm.weeklyHours}
                  onChange={(e) => setSubjectForm({ ...subjectForm, weeklyHours: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Status
                </label>
                <Select
                  value={subjectForm.status}
                  onChange={(e) => setSubjectForm({ ...subjectForm, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="requiresLabCheck"
                checked={subjectForm.requiresLab}
                onChange={(e) => setSubjectForm({ ...subjectForm, requiresLab: e.target.checked })}
                className="rounded border-[#1E2330] bg-[#0B0D14] text-teal-500 focus:ring-teal-500 w-4 h-4"
              />
              <label htmlFor="requiresLabCheck" className="text-sm text-gray-300">
                Requires Laboratory Infrastructure for Practical Sessions
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1E2330]">
              <Button type="button" variant="outline" onClick={() => setShowSubjectModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingSubjectId ? 'Update Subject' : 'Create Subject'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. CREATE / EDIT SECTION MODAL */}
      {showSectionModal && (
        <Modal
          isOpen={showSectionModal}
          onClose={() => setShowSectionModal(false)}
          title={editingSectionId ? 'Edit Class Section' : 'Create New Class Section'}
        >
          <form onSubmit={handleSaveSection} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Department *
                </label>
                <Select
                  required
                  value={sectionForm.departmentId}
                  onChange={(e) => {
                    const deptId = Number(e.target.value);
                    const progs = activeProgramsForDept(deptId);
                    setSectionForm({
                      ...sectionForm,
                      departmentId: deptId,
                      programId: progs[0]?.id || 0
                    });
                  }}
                >
                  <option value={0}>Select Department...</option>
                  {activeDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Degree Program *
                </label>
                <Select
                  required
                  value={sectionForm.programId}
                  onChange={(e) => setSectionForm({ ...sectionForm, programId: Number(e.target.value) })}
                >
                  <option value={0}>Select Program...</option>
                  {activeProgramsForDept(sectionForm.departmentId).map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                Semester Term *
              </label>
              <Select
                required
                value={sectionForm.semesterId}
                onChange={(e) => setSectionForm({ ...sectionForm, semesterId: Number(e.target.value) })}
              >
                <option value={0}>Select Semester Term...</option>
                {referenceData?.semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Section Name *
                </label>
                <Input
                  required
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  placeholder="e.g. Section A"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Capacity *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  required
                  value={sectionForm.capacity}
                  onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Status
                </label>
                <Select
                  value={sectionForm.status}
                  onChange={(e) => setSectionForm({ ...sectionForm, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#1E2330]">
              <Button type="button" variant="outline" onClick={() => setShowSectionModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingSectionId ? 'Update Section' : 'Create Section'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 8. DETAILS MODAL (DEPARTMENT) */}
      {selectedDeptDetails && (
        <Modal
          isOpen={!!selectedDeptDetails}
          onClose={() => setSelectedDeptDetails(null)}
          title={`Department Details: ${selectedDeptDetails.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div>
                <span className="font-mono font-bold text-teal-400 text-lg">{selectedDeptDetails.code}</span>
                <p className="text-sm text-gray-300">{selectedDeptDetails.name}</p>
              </div>
              <Badge variant={selectedDeptDetails.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                {selectedDeptDetails.status}
              </Badge>
            </div>

            {selectedDeptDetails.description && (
              <p className="text-sm text-gray-400 italic bg-[#0B0D14] p-3 rounded border border-[#1E2330]">
                {selectedDeptDetails.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Head of Department</span>
                <p className="font-semibold text-white mt-1">
                  {selectedDeptDetails.activeHodName || 'Unassigned'}
                </p>
              </div>
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Parent Institution</span>
                <p className="font-semibold text-white mt-1">{selectedDeptDetails.institutionName}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-2">
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Programs</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedDeptDetails.totalPrograms}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Faculty</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedDeptDetails.totalFaculty}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Students</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedDeptDetails.totalStudents}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Rooms</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedDeptDetails.totalRooms}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2330]">
              <Button variant="outline" onClick={() => setSelectedDeptDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. DETAILS MODAL (ACADEMIC YEAR) */}
      {selectedYearDetails && (
        <Modal
          isOpen={!!selectedYearDetails}
          onClose={() => setSelectedYearDetails(null)}
          title={`Academic Year: ${selectedYearDetails.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div>
                <span className="font-mono font-bold text-teal-400 text-lg">{selectedYearDetails.name}</span>
                <p className="text-xs text-gray-400">
                  {selectedYearDetails.startDate} &rarr; {selectedYearDetails.endDate}
                </p>
              </div>
              <Badge variant={selectedYearDetails.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                {selectedYearDetails.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Defined Semesters</span>
                <p className="text-xl font-bold text-white mt-1">{selectedYearDetails.totalSemesters}</p>
              </div>
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Resource Allocations</span>
                <p className="text-xl font-bold text-white mt-1">{selectedYearDetails.totalAllocations}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2330]">
              <Button variant="outline" onClick={() => setSelectedYearDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 10. DETAILS MODAL (SEMESTER) */}
      {selectedSemesterDetails && (
        <Modal
          isOpen={!!selectedSemesterDetails}
          onClose={() => setSelectedSemesterDetails(null)}
          title={`Semester ${selectedSemesterDetails.semesterNumber} Details`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div>
                <span className="font-mono font-bold text-teal-400 text-lg">
                  Semester {selectedSemesterDetails.semesterNumber}
                </span>
                <p className="text-xs text-gray-400">{selectedSemesterDetails.academicYearName}</p>
              </div>
              <Badge variant={selectedSemesterDetails.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                {selectedSemesterDetails.status}
              </Badge>
            </div>

            <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330] text-sm">
              <span className="text-xs text-gray-400 uppercase">Term Dates</span>
              <p className="font-semibold text-white mt-1">
                {selectedSemesterDetails.startDate} to {selectedSemesterDetails.endDate}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Active Sections</span>
                <p className="text-xl font-bold text-white mt-1">{selectedSemesterDetails.totalSections}</p>
              </div>
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Allocations</span>
                <p className="text-xl font-bold text-white mt-1">{selectedSemesterDetails.totalAllocations}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2330]">
              <Button variant="outline" onClick={() => setSelectedSemesterDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 11. DETAILS MODAL (PROGRAM) */}
      {selectedProgramDetails && (
        <Modal
          isOpen={!!selectedProgramDetails}
          onClose={() => setSelectedProgramDetails(null)}
          title={`Program Details: ${selectedProgramDetails.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div>
                <span className="font-mono font-bold text-teal-400 text-lg">{selectedProgramDetails.code}</span>
                <p className="text-sm text-gray-300">{selectedProgramDetails.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="purple">{selectedProgramDetails.programType}</Badge>
                <Badge variant={selectedProgramDetails.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                  {selectedProgramDetails.status}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330] text-sm">
              <span className="text-xs text-gray-400 uppercase">Department</span>
              <p className="font-semibold text-white mt-1">
                {selectedProgramDetails.departmentName} ({selectedProgramDetails.departmentCode})
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Duration</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedProgramDetails.durationYears}y</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Semesters</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedProgramDetails.totalSemesters}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Subjects</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedProgramDetails.totalSubjects}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Students</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedProgramDetails.totalStudents}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2330]">
              <Button variant="outline" onClick={() => setSelectedProgramDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 12. DETAILS MODAL (SUBJECT) */}
      {selectedSubjectDetails && (
        <Modal
          isOpen={!!selectedSubjectDetails}
          onClose={() => setSelectedSubjectDetails(null)}
          title={`Subject Details: ${selectedSubjectDetails.code}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div>
                <span className="font-mono font-bold text-teal-400 text-lg">{selectedSubjectDetails.code}</span>
                <p className="text-sm text-gray-200 font-semibold">{selectedSubjectDetails.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="blue">{selectedSubjectDetails.type}</Badge>
                <Badge variant={selectedSubjectDetails.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                  {selectedSubjectDetails.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Department</span>
                <p className="font-semibold text-white mt-1">
                  {selectedSubjectDetails.departmentName} ({selectedSubjectDetails.departmentCode})
                </p>
              </div>
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Program & Semester</span>
                <p className="font-semibold text-white mt-1">
                  {selectedSubjectDetails.programName} &bull; Sem {selectedSubjectDetails.semesterNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Credits</span>
                <p className="text-base font-bold text-teal-400 mt-0.5">{selectedSubjectDetails.credits}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Weekly Hours</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedSubjectDetails.weeklyHours} hrs</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Lab Required</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {selectedSubjectDetails.requiresLab ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2330]">
              <Button variant="outline" onClick={() => setSelectedSubjectDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 13. DETAILS MODAL (SECTION) */}
      {selectedSectionDetails && (
        <Modal
          isOpen={!!selectedSectionDetails}
          onClose={() => setSelectedSectionDetails(null)}
          title={`Section Details: ${selectedSectionDetails.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div>
                <span className="font-mono font-bold text-teal-400 text-lg">{selectedSectionDetails.name}</span>
                <p className="text-xs text-gray-400">
                  {selectedSectionDetails.academicYearName} &bull; Sem {selectedSectionDetails.semesterNumber}
                </p>
              </div>
              <Badge variant={selectedSectionDetails.status === 'ACTIVE' ? 'teal' : 'neutral'}>
                {selectedSectionDetails.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Department</span>
                <p className="font-semibold text-white mt-1">
                  {selectedSectionDetails.departmentName} ({selectedSectionDetails.departmentCode})
                </p>
              </div>
              <div className="p-3 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400 uppercase">Degree Program</span>
                <p className="font-semibold text-white mt-1">{selectedSectionDetails.programName}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Capacity</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedSectionDetails.capacity}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Enrolled Students</span>
                <p className="text-base font-bold text-teal-400 mt-0.5">{selectedSectionDetails.studentCount}</p>
              </div>
              <div className="p-2 bg-[#0B0D14] rounded border border-[#1E2330]">
                <span className="text-xs text-gray-400">Allocations</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedSectionDetails.totalAllocations}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2330]">
              <Button variant="outline" onClick={() => setSelectedSectionDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        description={confirmConfig.message}
        variant={confirmConfig.variant || 'primary'}
        confirmText={confirmConfig.confirmText || 'Confirm'}
        onConfirm={async () => {
          setConfirmConfig({ ...confirmConfig, isOpen: false });
          await confirmConfig.onConfirm();
        }}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />
    </div>
  );
};

export default AcademicManagementPage;
