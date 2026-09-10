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
  adminStaffApi,
  StaffReferenceData,
  FacultySummary,
  FacultyDetails,
  CreateFacultyData,
  UpdateFacultyData,
  HodSummary,
  HodDetails,
  CreateHodAssignmentData,
  UpdateHodAssignmentData,
  PrincipalData,
  AssignPrincipalData,
  UpdatePrincipalAssignmentData,
  WardenSummary,
  WardenDetails,
  CreateWardenData,
  UpdateWardenData,
} from '../../services/api/adminStaffApi';
import { useAdminFaculty } from '../../hooks/useAdminFaculty';
import { useAdminHods } from '../../hooks/useAdminHods';
import { useAdminPrincipal } from '../../hooks/useAdminPrincipal';
import { useAdminWardens } from '../../hooks/useAdminWardens';

// Icons
import {
  Users,
  Briefcase,
  ShieldCheck,
  KeyRound,
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
  Building,
  Phone,
  User,
  Shield,
  Calendar,
  Layers,
  GraduationCap,
  Award,
  Home,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

type StaffTab = 'faculty' | 'hod' | 'principal' | 'warden';

export const StaffManagementPage: React.FC<{ initialTab?: StaffTab }> = ({ initialTab = 'faculty' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as StaffTab) || initialTab;

  const setTab = (tab: StaffTab) => {
    setSearchParams({ tab });
  };

  // Toast State
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  // Reference Data State
  const [referenceData, setReferenceData] = useState<StaffReferenceData | null>(null);
  const [loadingRefData, setLoadingRefData] = useState(false);

  const loadReferenceData = async () => {
    try {
      setLoadingRefData(true);
      const res = await adminStaffApi.getReferenceData();
      if (res.success && res.data) {
        setReferenceData(res.data);
      }
    } catch (err: any) {
      showToast('Failed to load institutional reference lists', 'error');
    } finally {
      setLoadingRefData(false);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  // Module Hooks
  const facultyModule = useAdminFaculty(15);
  const hodModule = useAdminHods(15);
  const principalModule = useAdminPrincipal(10);
  const wardenModule = useAdminWardens(15);

  // =========================================================================
  // MODAL STATES
  // =========================================================================

  // Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsType, setDetailsType] = useState<StaffTab>('faculty');
  const [detailsData, setDetailsData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status Confirmation Dialog
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    tab: StaffTab;
    id: number;
    name: string;
    nextStatus: string;
  } | null>(null);
  const [isSubmittingStatus, setIsSubmittingAction] = useState(false);

  // Faculty Modals
  const [isCreateFacultyOpen, setIsCreateFacultyOpen] = useState(false);
  const [isEditFacultyOpen, setIsEditFacultyOpen] = useState(false);
  const [facultyFormMode, setFacultyFormMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [createFacultyForm, setCreateFacultyForm] = useState<CreateFacultyData>({
    employeeId: '',
    departmentId: 0,
    designation: '',
    qualification: '',
    specialization: '',
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [editingFaculty, setEditingFaculty] = useState<FacultySummary | null>(null);
  const [editFacultyForm, setEditFacultyForm] = useState<UpdateFacultyData>({
    departmentId: 0,
    designation: '',
    qualification: '',
    specialization: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // HOD Modals
  const [isAssignHodOpen, setIsAssignHodOpen] = useState(false);
  const [isEditHodOpen, setIsEditHodOpen] = useState(false);
  const [editingHod, setEditingHod] = useState<HodSummary | null>(null);
  const [assignHodForm, setAssignHodForm] = useState<CreateHodAssignmentData>({
    departmentId: 0,
    facultyId: 0,
    startDate: new Date().toISOString().split('T')[0],
  });
  const [editHodForm, setEditHodForm] = useState<UpdateHodAssignmentData>({
    startDate: '',
    endDate: '',
  });

  // Principal Modals
  const [isAssignPrincipalOpen, setIsAssignPrincipalOpen] = useState(false);
  const [isEditPrincipalOpen, setIsEditPrincipalOpen] = useState(false);
  const [editingPrincipal, setEditingPrincipal] = useState<PrincipalData | null>(null);
  const [assignPrincipalForm, setAssignPrincipalForm] = useState<AssignPrincipalData>({
    institutionId: 1,
    facultyId: 0,
    startDate: new Date().toISOString().split('T')[0],
  });
  const [editPrincipalForm, setEditPrincipalForm] = useState<UpdatePrincipalAssignmentData>({
    startDate: '',
    endDate: '',
  });

  // Warden Modals
  const [isCreateWardenOpen, setIsCreateWardenOpen] = useState(false);
  const [isEditWardenOpen, setIsEditWardenOpen] = useState(false);
  const [isAssignHostelsOpen, setIsAssignHostelsOpen] = useState(false);
  const [wardenFormMode, setWardenFormMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [createWardenForm, setCreateWardenForm] = useState<CreateWardenData>({
    employeeId: '',
    contactNumber: '',
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    hostelIds: [],
  });
  const [editingWarden, setEditingWarden] = useState<WardenSummary | null>(null);
  const [editWardenForm, setEditWardenForm] = useState<UpdateWardenData>({
    contactNumber: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [selectedWardenHostelIds, setSelectedWardenHostelIds] = useState<number[]>([]);

  // Submitting States
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // View Details
  const handleOpenDetails = async (tab: StaffTab, id: number) => {
    setDetailsType(tab);
    setLoadingDetails(true);
    setIsDetailsModalOpen(true);
    try {
      if (tab === 'faculty') {
        const details = await facultyModule.getFacultyDetails(id);
        setDetailsData(details);
      } else if (tab === 'hod') {
        const details = await hodModule.getHodDetails(id);
        setDetailsData(details);
      } else if (tab === 'principal') {
        const details = await principalModule.getPrincipalDetails(id);
        setDetailsData(details);
      } else if (tab === 'warden') {
        const details = await wardenModule.getWardenDetails(id);
        setDetailsData(details);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load details', 'error');
      setIsDetailsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Status Changes
  const handleRequestStatusChange = (tab: StaffTab, id: number, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setPendingStatusChange({ tab, id, name, nextStatus });
    setIsStatusConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    setIsSubmittingAction(true);
    try {
      const { tab, id, nextStatus } = pendingStatusChange;
      if (tab === 'faculty') {
        await facultyModule.updateStatus(id, nextStatus);
      } else if (tab === 'hod') {
        await hodModule.updateStatus(id, nextStatus);
      } else if (tab === 'principal') {
        await principalModule.updateStatus(id, nextStatus);
      } else if (tab === 'warden') {
        await wardenModule.updateStatus(id, nextStatus);
      }
      showToast(`Status updated to ${nextStatus} successfully`);
      setIsStatusConfirmOpen(false);
      setPendingStatusChange(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Faculty Handlers
  const handleOpenCreateFaculty = () => {
    setCreateFacultyForm({
      employeeId: '',
      departmentId: referenceData?.departments[0]?.id || 0,
      designation: 'Assistant Professor',
      qualification: 'Ph.D.',
      specialization: '',
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });
    setFacultyFormMode('NEW');
    setIsCreateFacultyOpen(true);
  };

  const handleSubmitCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFacultyForm.employeeId.trim()) {
      showToast('Employee ID is required', 'error');
      return;
    }
    if (!createFacultyForm.departmentId) {
      showToast('Department selection is required', 'error');
      return;
    }
    if (facultyFormMode === 'NEW' && (!createFacultyForm.username?.trim() || !createFacultyForm.email?.trim() || !createFacultyForm.password?.trim())) {
      showToast('Username, email, and password are required for new user account', 'error');
      return;
    }
    if (facultyFormMode === 'EXISTING' && !createFacultyForm.existingUserId) {
      showToast('Please select an existing user', 'error');
      return;
    }

    setIsSubmittingForm(true);
    try {
      await facultyModule.createFaculty(createFacultyForm);
      showToast('Faculty member provisioned successfully');
      setIsCreateFacultyOpen(false);
      loadReferenceData(); // Refresh eligible lists
    } catch (err: any) {
      showToast(err.message || 'Failed to create faculty member', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenEditFaculty = (fac: FacultySummary) => {
    setEditingFaculty(fac);
    setEditFacultyForm({
      departmentId: fac.departmentId,
      designation: fac.designation,
      qualification: fac.qualification || '',
      specialization: fac.specialization || '',
      firstName: fac.firstName,
      lastName: fac.lastName,
      email: fac.email,
      phone: fac.phone || '',
    });
    setIsEditFacultyOpen(true);
  };

  const handleSubmitEditFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setIsSubmittingForm(true);
    try {
      await facultyModule.updateFaculty(editingFaculty.id, editFacultyForm);
      showToast('Faculty details updated successfully');
      setIsEditFacultyOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update faculty member', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // HOD Handlers
  const handleOpenAssignHod = () => {
    setAssignHodForm({
      departmentId: referenceData?.departments[0]?.id || 0,
      facultyId: referenceData?.eligibleFaculty[0]?.id || 0,
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsAssignHodOpen(true);
  };

  const handleSubmitAssignHod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignHodForm.departmentId) {
      showToast('Department is required', 'error');
      return;
    }
    if (!assignHodForm.facultyId) {
      showToast('Faculty selection is required', 'error');
      return;
    }

    setIsSubmittingForm(true);
    try {
      await hodModule.assignHod(assignHodForm);
      showToast('Head of Department assigned successfully');
      setIsAssignHodOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to assign HOD', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenEditHod = (hod: HodSummary) => {
    setEditingHod(hod);
    setEditHodForm({
      startDate: hod.startDate,
      endDate: hod.endDate || '',
    });
    setIsEditHodOpen(true);
  };

  const handleSubmitEditHod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHod) return;
    setIsSubmittingForm(true);
    try {
      await hodModule.updateHodAssignment(editingHod.id, editHodForm);
      showToast('HOD assignment terms updated successfully');
      setIsEditHodOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update HOD assignment', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Principal Handlers
  const handleOpenAssignPrincipal = () => {
    setAssignPrincipalForm({
      institutionId: referenceData?.institutions[0]?.id || 1,
      facultyId: referenceData?.eligibleFaculty[0]?.id || 0,
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsAssignPrincipalOpen(true);
  };

  const handleSubmitAssignPrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignPrincipalForm.facultyId) {
      showToast('Faculty selection is required', 'error');
      return;
    }

    setIsSubmittingForm(true);
    try {
      await principalModule.assignPrincipal(assignPrincipalForm);
      showToast('Principal assignment established successfully');
      setIsAssignPrincipalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to assign Principal', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenEditPrincipal = (pr: PrincipalData) => {
    setEditingPrincipal(pr);
    setEditPrincipalForm({
      startDate: pr.startDate,
      endDate: pr.endDate || '',
    });
    setIsEditPrincipalOpen(true);
  };

  const handleSubmitEditPrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrincipal) return;
    setIsSubmittingForm(true);
    try {
      await principalModule.updatePrincipalAssignment(editingPrincipal.id, editPrincipalForm);
      showToast('Principal assignment terms updated successfully');
      setIsEditPrincipalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update Principal assignment', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Warden Handlers
  const handleOpenCreateWarden = () => {
    setCreateWardenForm({
      employeeId: '',
      contactNumber: '',
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      hostelIds: [],
    });
    setWardenFormMode('NEW');
    setIsCreateWardenOpen(true);
  };

  const handleSubmitCreateWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createWardenForm.employeeId.trim()) {
      showToast('Employee ID is required', 'error');
      return;
    }
    if (!createWardenForm.contactNumber?.trim()) {
      showToast('Contact number is required', 'error');
      return;
    }
    if (wardenFormMode === 'NEW' && (!createWardenForm.username?.trim() || !createWardenForm.email?.trim() || !createWardenForm.password?.trim())) {
      showToast('Username, email, and password are required', 'error');
      return;
    }
    if (wardenFormMode === 'EXISTING' && !createWardenForm.existingUserId) {
      showToast('Please select an existing user', 'error');
      return;
    }

    setIsSubmittingForm(true);
    try {
      await wardenModule.createWarden(createWardenForm);
      showToast('Hostel Warden created successfully');
      setIsCreateWardenOpen(false);
      loadReferenceData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create Warden', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenEditWarden = (w: WardenSummary) => {
    setEditingWarden(w);
    setEditWardenForm({
      contactNumber: w.contactNumber || '',
      firstName: w.firstName,
      lastName: w.lastName,
      email: w.email,
    });
    setIsEditWardenOpen(true);
  };

  const handleSubmitEditWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarden) return;
    setIsSubmittingForm(true);
    try {
      await wardenModule.updateWarden(editingWarden.id, editWardenForm);
      showToast('Warden record updated successfully');
      setIsEditWardenOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update Warden', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleOpenAssignHostels = (w: WardenSummary) => {
    setEditingWarden(w);
    setSelectedWardenHostelIds(w.assignedHostels.map((h) => h.id));
    setIsAssignHostelsOpen(true);
  };

  const handleToggleHostelSelection = (hostelId: number) => {
    setSelectedWardenHostelIds((prev) =>
      prev.includes(hostelId) ? prev.filter((id) => id !== hostelId) : [...prev, hostelId]
    );
  };

  const handleSubmitAssignHostels = async () => {
    if (!editingWarden) return;
    setIsSubmittingForm(true);
    try {
      await wardenModule.assignHostels(editingWarden.id, selectedWardenHostelIds);
      showToast('Hostel assignments updated successfully');
      setIsAssignHostelsOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update hostel assignments', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Global Refresh
  const handleRefreshAll = () => {
    loadReferenceData();
    if (currentTab === 'faculty') facultyModule.refresh();
    else if (currentTab === 'hod') hodModule.refresh();
    else if (currentTab === 'principal') principalModule.refresh();
    else if (currentTab === 'warden') wardenModule.refresh();
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast */}
      {feedbackToast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border transition-all ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
              : 'bg-rose-950/90 text-rose-300 border-rose-800'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{feedbackToast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-teal-400" />
            Staff Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centralized institutional governance for Faculty, Department HODs, Principal Office, and Hostel Wardens
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="border-[#2A2E3D] hover:bg-[#1A1D27] text-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {currentTab === 'faculty' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateFaculty}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Faculty
            </Button>
          )}

          {currentTab === 'hod' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAssignHod}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Assign HOD
            </Button>
          )}

          {currentTab === 'principal' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAssignPrincipal}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Assign Principal
            </Button>
          )}

          {currentTab === 'warden' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateWarden}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Add Warden
            </Button>
          )}
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#11141C] border-[#222838] p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Faculty</p>
            <p className="text-2xl font-bold text-white mt-0.5">{facultyModule.totalElements}</p>
            <p className="text-xs text-slate-400 mt-0.5">Active Academic Members</p>
          </div>
        </Card>

        <Card className="bg-[#11141C] border-[#222838] p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Department HODs</p>
            <p className="text-2xl font-bold text-white mt-0.5">{hodModule.totalElements}</p>
            <p className="text-xs text-slate-400 mt-0.5">Chaired Departments</p>
          </div>
        </Card>

        <Card className="bg-[#11141C] border-[#222838] p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Principal Office</p>
            <p className="text-base font-bold text-white mt-0.5 truncate max-w-[170px]">
              {principalModule.currentPrincipal
                ? principalModule.currentPrincipal.facultyName
                : 'Unassigned'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {principalModule.currentPrincipal ? 'Active Executive Head' : 'Vacancy Pending'}
            </p>
          </div>
        </Card>

        <Card className="bg-[#11141C] border-[#222838] p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Hostel Wardens</p>
            <p className="text-2xl font-bold text-white mt-0.5">{wardenModule.totalElements}</p>
            <p className="text-xs text-slate-400 mt-0.5">Residential Wardens</p>
          </div>
        </Card>
      </div>

      {/* Main Container */}
      <Card className="bg-[#11141C] border-[#222838] overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 border-b border-[#222838] flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex p-1 rounded-xl bg-[#171A23] border border-[#2A2E3D]">
            <button
              onClick={() => setTab('faculty')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'faculty'
                  ? 'bg-teal-500 text-black shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Faculty
            </button>

            <button
              onClick={() => setTab('hod')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'hod'
                  ? 'bg-teal-500 text-black shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              HOD
            </button>

            <button
              onClick={() => setTab('principal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'principal'
                  ? 'bg-teal-500 text-black shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Principal
            </button>

            <button
              onClick={() => setTab('warden')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'warden'
                  ? 'bg-teal-500 text-black shadow-md font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Warden
            </button>
          </div>

          {/* Contextual Toolbar Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={
                  currentTab === 'faculty'
                    ? 'Search faculty name, ID, email...'
                    : currentTab === 'hod'
                    ? 'Search HOD name, department...'
                    : currentTab === 'principal'
                    ? 'Search principal name, ID...'
                    : 'Search warden name, ID...'
                }
                value={
                  currentTab === 'faculty'
                    ? facultyModule.search
                    : currentTab === 'hod'
                    ? hodModule.search
                    : currentTab === 'principal'
                    ? principalModule.search
                    : wardenModule.search
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (currentTab === 'faculty') facultyModule.setSearch(val);
                  else if (currentTab === 'hod') hodModule.setSearch(val);
                  else if (currentTab === 'principal') principalModule.setSearch(val);
                  else if (currentTab === 'warden') wardenModule.setSearch(val);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#171A23] border border-[#2A2E3D] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Department Filter (Faculty & HOD) */}
            {(currentTab === 'faculty' || currentTab === 'hod') && (
              <select
                value={currentTab === 'faculty' ? facultyModule.departmentFilter : hodModule.departmentFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  if (currentTab === 'faculty') facultyModule.setDepartmentFilter(val);
                  else hodModule.setDepartmentFilter(val);
                }}
                className="text-sm bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Departments</option>
                {referenceData?.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            )}

            {/* Hostel Filter (Warden) */}
            {currentTab === 'warden' && (
              <select
                value={wardenModule.hostelFilter}
                onChange={(e) => wardenModule.setHostelFilter(e.target.value)}
                className="text-sm bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Hostels</option>
                {referenceData?.hostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.type})
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={
                currentTab === 'faculty'
                  ? facultyModule.statusFilter
                  : currentTab === 'hod'
                  ? hodModule.statusFilter
                  : currentTab === 'principal'
                  ? principalModule.statusFilter
                  : wardenModule.statusFilter
              }
              onChange={(e) => {
                const val = e.target.value;
                if (currentTab === 'faculty') facultyModule.setStatusFilter(val);
                else if (currentTab === 'hod') hodModule.setStatusFilter(val);
                else if (currentTab === 'principal') principalModule.setStatusFilter(val);
                else if (currentTab === 'warden') wardenModule.setStatusFilter(val);
              }}
              className="text-sm bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* TAB 1: FACULTY MANAGEMENT */}
        {currentTab === 'faculty' && (
          <div>
            {facultyModule.loading ? (
              <div className="p-6">
                <SkeletonTable rows={5} columns={6} />
              </div>
            ) : facultyModule.error ? (
              <div className="p-6 space-y-3">
                <ErrorMessage message={facultyModule.error} />
                <Button size="sm" variant="outline" onClick={facultyModule.refresh}>
                  Retry
                </Button>
              </div>
            ) : facultyModule.faculty.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Users}
                  title="No Faculty Members Found"
                  description="No academic faculty records matched your filter criteria."
                  actionLabel="Add Faculty Member"
                  onAction={handleOpenCreateFaculty}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#171A23] text-slate-400 uppercase tracking-wider text-xs border-b border-[#222838]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Employee ID</th>
                      <th className="px-6 py-3 font-semibold">Name</th>
                      <th className="px-6 py-3 font-semibold">Email</th>
                      <th className="px-6 py-3 font-semibold">Department</th>
                      <th className="px-6 py-3 font-semibold">Designation</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222838]">
                    {facultyModule.faculty.map((f) => (
                      <tr key={f.id} className="hover:bg-[#151924] transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-teal-400">{f.employeeId}</td>
                        <td className="px-6 py-4 font-semibold text-white">
                          {f.firstName} {f.lastName}
                        </td>
                        <td className="px-6 py-4 text-slate-400">{f.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {f.departmentCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{f.designation}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              f.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenDetails('faculty', f.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors"
                              title="View Faculty Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditFaculty(f)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Edit Faculty Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleRequestStatusChange(
                                  'faculty',
                                  f.id,
                                  `${f.firstName} ${f.lastName}`,
                                  f.status
                                )
                              }
                              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                                f.status === 'ACTIVE'
                                  ? 'text-slate-400 hover:text-rose-400'
                                  : 'text-slate-400 hover:text-emerald-400'
                              }`}
                              title={f.status === 'ACTIVE' ? 'Deactivate Faculty' : 'Activate Faculty'}
                            >
                              {f.status === 'ACTIVE' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
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

            {facultyModule.totalPages > 1 && (
              <div className="p-4 border-t border-[#222838]">
                <Pagination
                  currentPage={facultyModule.page + 1}
                  totalPages={facultyModule.totalPages}
                  onPageChange={(p) => facultyModule.setPage(p - 1)}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HOD MANAGEMENT */}
        {currentTab === 'hod' && (
          <div>
            {hodModule.loading ? (
              <div className="p-6">
                <SkeletonTable rows={5} columns={6} />
              </div>
            ) : hodModule.error ? (
              <div className="p-6 space-y-3">
                <ErrorMessage message={hodModule.error} />
                <Button size="sm" variant="outline" onClick={hodModule.refresh}>
                  Retry
                </Button>
              </div>
            ) : hodModule.hods.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Briefcase}
                  title="No HOD Assignments Found"
                  description="No departmental leadership appointments match your filters."
                  actionLabel="Assign Head of Department"
                  onAction={handleOpenAssignHod}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#171A23] text-slate-400 uppercase tracking-wider text-xs border-b border-[#222838]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Department</th>
                      <th className="px-6 py-3 font-semibold">Head of Department</th>
                      <th className="px-6 py-3 font-semibold">Employee ID</th>
                      <th className="px-6 py-3 font-semibold">Appointment Period</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222838]">
                    {hodModule.hods.map((h) => (
                      <tr key={h.id} className="hover:bg-[#151924] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{h.departmentName}</p>
                            <p className="text-xs text-teal-400 font-mono">{h.departmentCode}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-200">{h.facultyName}</p>
                          <p className="text-xs text-slate-400">{h.facultyEmail}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300">{h.employeeId}</td>
                        <td className="px-6 py-4 text-slate-400">
                          <div className="text-xs">
                            <span className="text-slate-300 font-medium">Since {h.startDate}</span>
                            {h.endDate && <p className="text-slate-500">until {h.endDate}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              h.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {h.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenDetails('hod', h.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors"
                              title="View HOD Assignment Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditHod(h)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Edit Appointment Terms"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleRequestStatusChange('hod', h.id, `${h.facultyName} (${h.departmentCode} HOD)`, h.status)
                              }
                              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                                h.status === 'ACTIVE'
                                  ? 'text-slate-400 hover:text-rose-400'
                                  : 'text-slate-400 hover:text-emerald-400'
                              }`}
                              title={h.status === 'ACTIVE' ? 'Deactivate HOD Assignment' : 'Reactivate HOD Assignment'}
                            >
                              {h.status === 'ACTIVE' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
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

            {hodModule.totalPages > 1 && (
              <div className="p-4 border-t border-[#222838]">
                <Pagination
                  currentPage={hodModule.page + 1}
                  totalPages={hodModule.totalPages}
                  onPageChange={(p) => hodModule.setPage(p - 1)}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRINCIPAL MANAGEMENT */}
        {currentTab === 'principal' && (
          <div className="p-6 space-y-6">
            {/* Active Principal Hero Card */}
            {principalModule.currentPrincipal ? (
              <div className="bg-gradient-to-r from-[#141926] to-[#10141E] p-6 rounded-2xl border border-teal-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500 text-black">
                          ACTIVE INCUMBENT
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: {principalModule.currentPrincipal.employeeId}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mt-1">
                        {principalModule.currentPrincipal.facultyName}
                      </h2>
                      <p className="text-sm text-slate-300 flex items-center gap-4 mt-1">
                        <span>{principalModule.currentPrincipal.designation || 'Head of Institution'}</span>
                        <span>•</span>
                        <span>{principalModule.currentPrincipal.institutionName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails('principal', principalModule.currentPrincipal!.id)}
                      className="border-slate-700 hover:bg-slate-800 text-slate-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditPrincipal(principalModule.currentPrincipal!)}
                      className="border-slate-700 hover:bg-slate-800 text-blue-400"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Terms
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-800/80 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Official Email</span>
                    <span className="text-slate-300 font-medium">{principalModule.currentPrincipal.facultyEmail}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Appointment Start</span>
                    <span className="text-slate-300 font-medium">{principalModule.currentPrincipal.startDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Executive Role</span>
                    <span className="text-teal-400 font-medium">Institutional Authority</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-amber-500/30 rounded-2xl bg-amber-500/5 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-white">No Active Principal Assigned</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  The institution currently does not have an active Principal assignment on record.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAssignPrincipal}
                  className="mt-4 bg-teal-500 hover:bg-teal-600 text-black font-semibold"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Assign Principal
                </Button>
              </div>
            )}

            {/* Principal Assignment History Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  Executive Assignment History
                </h3>
              </div>

              {principalModule.loading ? (
                <SkeletonTable rows={4} columns={6} />
              ) : principalModule.history.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No Assignment Records"
                  description="No historical principal assignments found."
                />
              ) : (
                <div className="overflow-x-auto border border-[#222838] rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#171A23] text-slate-400 uppercase tracking-wider text-xs border-b border-[#222838]">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Principal Name</th>
                        <th className="px-6 py-3 font-semibold">Employee ID</th>
                        <th className="px-6 py-3 font-semibold">Institution</th>
                        <th className="px-6 py-3 font-semibold">Start Date</th>
                        <th className="px-6 py-3 font-semibold">End Date</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222838]">
                      {principalModule.history.map((pr) => (
                        <tr key={pr.id} className="hover:bg-[#151924] transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{pr.facultyName}</td>
                          <td className="px-6 py-4 font-mono text-teal-400">{pr.employeeId}</td>
                          <td className="px-6 py-4 text-slate-300">{pr.institutionName}</td>
                          <td className="px-6 py-4 text-slate-400">{pr.startDate}</td>
                          <td className="px-6 py-4 text-slate-400">{pr.endDate || 'Present'}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                pr.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {pr.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleOpenDetails('principal', pr.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors"
                                title="View Record"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestStatusChange('principal', pr.id, pr.facultyName, pr.status)
                                }
                                className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                                  pr.status === 'ACTIVE'
                                    ? 'text-slate-400 hover:text-rose-400'
                                    : 'text-slate-400 hover:text-emerald-400'
                                }`}
                                title={pr.status === 'ACTIVE' ? 'Conclude Assignment' : 'Activate Assignment'}
                              >
                                {pr.status === 'ACTIVE' ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
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
            </div>
          </div>
        )}

        {/* TAB 4: WARDEN MANAGEMENT */}
        {currentTab === 'warden' && (
          <div>
            {wardenModule.loading ? (
              <div className="p-6">
                <SkeletonTable rows={5} columns={6} />
              </div>
            ) : wardenModule.error ? (
              <div className="p-6 space-y-3">
                <ErrorMessage message={wardenModule.error} />
                <Button size="sm" variant="outline" onClick={wardenModule.refresh}>
                  Retry
                </Button>
              </div>
            ) : wardenModule.wardens.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={KeyRound}
                  title="No Wardens Found"
                  description="No residential hostel wardens matched your query."
                  actionLabel="Add Warden"
                  onAction={handleOpenCreateWarden}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#171A23] text-slate-400 uppercase tracking-wider text-xs border-b border-[#222838]">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Employee ID</th>
                      <th className="px-6 py-3 font-semibold">Warden Name</th>
                      <th className="px-6 py-3 font-semibold">Contact Details</th>
                      <th className="px-6 py-3 font-semibold">Supervised Hostels</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222838]">
                    {wardenModule.wardens.map((w) => (
                      <tr key={w.id} className="hover:bg-[#151924] transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-teal-400">{w.employeeId}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">
                            {w.firstName} {w.lastName}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">@{w.username}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          <div>
                            <p className="text-xs text-slate-400">{w.email}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {w.contactNumber || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {w.assignedHostels && w.assignedHostels.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {w.assignedHostels.map((h) => (
                                <span
                                  key={h.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                >
                                  <Home className="w-3 h-3 text-purple-400" />
                                  {h.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-amber-400/80 italic flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              w.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenDetails('warden', w.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors"
                              title="View Warden Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenAssignHostels(w)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-400 transition-colors"
                              title="Assign Supervised Hostels"
                            >
                              <Home className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditWarden(w)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Edit Warden"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleRequestStatusChange(
                                  'warden',
                                  w.id,
                                  `${w.firstName} ${w.lastName}`,
                                  w.status
                                )
                              }
                              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                                w.status === 'ACTIVE'
                                  ? 'text-slate-400 hover:text-rose-400'
                                  : 'text-slate-400 hover:text-emerald-400'
                              }`}
                              title={w.status === 'ACTIVE' ? 'Deactivate Warden' : 'Activate Warden'}
                            >
                              {w.status === 'ACTIVE' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
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

            {wardenModule.totalPages > 1 && (
              <div className="p-4 border-t border-[#222838]">
                <Pagination
                  currentPage={wardenModule.page + 1}
                  totalPages={wardenModule.totalPages}
                  onPageChange={(p) => wardenModule.setPage(p - 1)}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE FACULTY                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateFacultyOpen}
        onClose={() => setIsCreateFacultyOpen(false)}
        title="Provision Faculty Member"
      >
        <form onSubmit={handleSubmitCreateFaculty} className="space-y-4">
          <div className="flex rounded-lg bg-[#171A23] p-1 border border-[#2A2E3D]">
            <button
              type="button"
              onClick={() => setFacultyFormMode('NEW')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                facultyFormMode === 'NEW'
                  ? 'bg-teal-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create New User Account
            </button>
            <button
              type="button"
              onClick={() => setFacultyFormMode('EXISTING')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                facultyFormMode === 'EXISTING'
                  ? 'bg-teal-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Link Existing User
            </button>
          </div>

          {facultyFormMode === 'EXISTING' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Select Eligible User Account
              </label>
              <select
                value={createFacultyForm.existingUserId || ''}
                onChange={(e) =>
                  setCreateFacultyForm({ ...createFacultyForm, existingUserId: Number(e.target.value) })
                }
                className="w-full bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="">-- Choose Candidate User --</option>
                {referenceData?.unassignedFacultyUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} (@{u.username} - {u.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={createFacultyForm.firstName || ''}
                  onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, firstName: e.target.value })}
                  placeholder="e.g. Alan"
                  required
                />
                <Input
                  label="Last Name"
                  value={createFacultyForm.lastName || ''}
                  onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, lastName: e.target.value })}
                  placeholder="e.g. Turing"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Username"
                  value={createFacultyForm.username || ''}
                  onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, username: e.target.value })}
                  placeholder="e.g. alan.turing"
                  required
                />
                <Input
                  label="Official Email"
                  type="email"
                  value={createFacultyForm.email || ''}
                  onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, email: e.target.value })}
                  placeholder="e.g. alan.turing@ahrao.edu"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Initial Password"
                  type="password"
                  value={createFacultyForm.password || ''}
                  onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, password: e.target.value })}
                  placeholder="Strong password"
                  required
                />
                <Input
                  label="Phone Number"
                  value={createFacultyForm.phone || ''}
                  onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </>
          )}

          <div className="border-t border-[#2A2E3D] pt-3">
            <h4 className="text-xs uppercase font-bold text-teal-400 mb-3 tracking-wider">
              Academic Appointment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Employee ID"
                value={createFacultyForm.employeeId}
                onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, employeeId: e.target.value })}
                placeholder="e.g. FAC-CSE-001"
                required
              />
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Department
                </label>
                <select
                  value={createFacultyForm.departmentId}
                  onChange={(e) =>
                    setCreateFacultyForm({ ...createFacultyForm, departmentId: Number(e.target.value) })
                  }
                  className="w-full bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-2 text-sm text-slate-200"
                  required
                >
                  <option value="">-- Choose Department --</option>
                  {referenceData?.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Input
                label="Designation"
                value={createFacultyForm.designation}
                onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, designation: e.target.value })}
                placeholder="e.g. Associate Professor"
                required
              />
              <Input
                label="Highest Qualification"
                value={createFacultyForm.qualification || ''}
                onChange={(e) => setCreateFacultyForm({ ...createFacultyForm, qualification: e.target.value })}
                placeholder="e.g. Ph.D. in Computer Engineering"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateFacultyOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Saving...' : 'Provision Faculty'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT FACULTY                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditFacultyOpen}
        onClose={() => setIsEditFacultyOpen(false)}
        title={`Edit Faculty: ${editingFaculty?.employeeId}`}
      >
        <form onSubmit={handleSubmitEditFaculty} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={editFacultyForm.firstName || ''}
              onChange={(e) => setEditFacultyForm({ ...editFacultyForm, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={editFacultyForm.lastName || ''}
              onChange={(e) => setEditFacultyForm({ ...editFacultyForm, lastName: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={editFacultyForm.email || ''}
              onChange={(e) => setEditFacultyForm({ ...editFacultyForm, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={editFacultyForm.phone || ''}
              onChange={(e) => setEditFacultyForm({ ...editFacultyForm, phone: e.target.value })}
            />
          </div>

          <div className="border-t border-[#2A2E3D] pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Department
                </label>
                <select
                  value={editFacultyForm.departmentId}
                  onChange={(e) =>
                    setEditFacultyForm({ ...editFacultyForm, departmentId: Number(e.target.value) })
                  }
                  className="w-full bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-2 text-sm text-slate-200"
                  required
                >
                  {referenceData?.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Designation"
                value={editFacultyForm.designation}
                onChange={(e) => setEditFacultyForm({ ...editFacultyForm, designation: e.target.value })}
                required
              />
            </div>

            <div className="mt-3">
              <Input
                label="Qualification"
                value={editFacultyForm.qualification || ''}
                onChange={(e) => setEditFacultyForm({ ...editFacultyForm, qualification: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditFacultyOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Saving...' : 'Update Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN HOD                                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAssignHodOpen}
        onClose={() => setIsAssignHodOpen(false)}
        title="Assign Department Head (HOD)"
      >
        <form onSubmit={handleSubmitAssignHod} className="space-y-4">
          <p className="text-xs text-slate-400">
            Select an academic department and an eligible faculty member. The selected faculty will be granted the{' '}
            <strong className="text-teal-400">HOD</strong> role and institutional chair responsibilities.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Department
            </label>
            <select
              value={assignHodForm.departmentId}
              onChange={(e) => setAssignHodForm({ ...assignHodForm, departmentId: Number(e.target.value) })}
              className="w-full bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-2 text-sm text-slate-200"
              required
            >
              <option value="">-- Choose Department --</option>
              {referenceData?.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Faculty Candidate
            </label>
            <select
              value={assignHodForm.facultyId}
              onChange={(e) => setAssignHodForm({ ...assignHodForm, facultyId: Number(e.target.value) })}
              className="w-full bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-2 text-sm text-slate-200"
              required
            >
              <option value="">-- Choose Faculty Member --</option>
              {referenceData?.eligibleFaculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.employeeId} - {f.departmentName} - {f.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={assignHodForm.startDate || ''}
              onChange={(e) => setAssignHodForm({ ...assignHodForm, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date (Optional)"
              type="date"
              value={assignHodForm.endDate || ''}
              onChange={(e) => setAssignHodForm({ ...assignHodForm, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignHodOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Assigning...' : 'Confirm HOD Assignment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT HOD TERMS                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditHodOpen}
        onClose={() => setIsEditHodOpen(false)}
        title={`Update HOD Assignment: ${editingHod?.departmentCode}`}
      >
        <form onSubmit={handleSubmitEditHod} className="space-y-4">
          <div className="bg-[#171A23] p-3 rounded-xl border border-[#2A2E3D] text-sm">
            <p className="text-slate-400">Department: <strong className="text-white">{editingHod?.departmentName}</strong></p>
            <p className="text-slate-400 mt-1">Appointed HOD: <strong className="text-teal-400">{editingHod?.facultyName}</strong></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={editHodForm.startDate || ''}
              onChange={(e) => setEditHodForm({ ...editHodForm, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date (Conclude)"
              type="date"
              value={editHodForm.endDate || ''}
              onChange={(e) => setEditHodForm({ ...editHodForm, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditHodOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Saving...' : 'Update Terms'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: ASSIGN PRINCIPAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAssignPrincipalOpen}
        onClose={() => setIsAssignPrincipalOpen(false)}
        title="Appoint Institutional Principal"
      >
        <form onSubmit={handleSubmitAssignPrincipal} className="space-y-4">
          <p className="text-xs text-slate-400">
            Appoint a qualified faculty leader as the head of the institution. Assigning will attach the{' '}
            <strong className="text-teal-400">PRINCIPAL</strong> role. Any prior active assignment must be deactivated or concluded.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Select Principal Candidate
            </label>
            <select
              value={assignPrincipalForm.facultyId}
              onChange={(e) =>
                setAssignPrincipalForm({ ...assignPrincipalForm, facultyId: Number(e.target.value) })
              }
              className="w-full bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-2 text-sm text-slate-200"
              required
            >
              <option value="">-- Choose Senior Faculty --</option>
              {referenceData?.eligibleFaculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.fullName} ({f.employeeId} - {f.departmentName} - {f.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tenure Start Date"
              type="date"
              value={assignPrincipalForm.startDate || ''}
              onChange={(e) =>
                setAssignPrincipalForm({ ...assignPrincipalForm, startDate: e.target.value })
              }
              required
            />
            <Input
              label="Tenure End Date (Optional)"
              type="date"
              value={assignPrincipalForm.endDate || ''}
              onChange={(e) =>
                setAssignPrincipalForm({ ...assignPrincipalForm, endDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignPrincipalOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Confirming...' : 'Appoint Principal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT PRINCIPAL TERMS                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditPrincipalOpen}
        onClose={() => setIsEditPrincipalOpen(false)}
        title={`Update Tenure Terms: ${editingPrincipal?.facultyName}`}
      >
        <form onSubmit={handleSubmitEditPrincipal} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tenure Start Date"
              type="date"
              value={editPrincipalForm.startDate || ''}
              onChange={(e) => setEditPrincipalForm({ ...editPrincipalForm, startDate: e.target.value })}
              required
            />
            <Input
              label="Tenure End Date"
              type="date"
              value={editPrincipalForm.endDate || ''}
              onChange={(e) => setEditPrincipalForm({ ...editPrincipalForm, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditPrincipalOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Saving...' : 'Update Terms'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 7: CREATE WARDEN                                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateWardenOpen}
        onClose={() => setIsCreateWardenOpen(false)}
        title="Provision Hostel Warden"
      >
        <form onSubmit={handleSubmitCreateWarden} className="space-y-4">
          <div className="flex rounded-lg bg-[#171A23] p-1 border border-[#2A2E3D]">
            <button
              type="button"
              onClick={() => setWardenFormMode('NEW')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                wardenFormMode === 'NEW'
                  ? 'bg-teal-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create New User Account
            </button>
            <button
              type="button"
              onClick={() => setWardenFormMode('EXISTING')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                wardenFormMode === 'EXISTING'
                  ? 'bg-teal-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Link Existing User
            </button>
          </div>

          {wardenFormMode === 'EXISTING' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Select Eligible User Account
              </label>
              <select
                value={createWardenForm.existingUserId || ''}
                onChange={(e) =>
                  setCreateWardenForm({ ...createWardenForm, existingUserId: Number(e.target.value) })
                }
                className="w-full bg-[#171A23] border border-[#2A2E3D] rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="">-- Choose Candidate User --</option>
                {referenceData?.unassignedWardenUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} (@{u.username} - {u.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={createWardenForm.firstName || ''}
                  onChange={(e) => setCreateWardenForm({ ...createWardenForm, firstName: e.target.value })}
                  placeholder="e.g. John"
                  required
                />
                <Input
                  label="Last Name"
                  value={createWardenForm.lastName || ''}
                  onChange={(e) => setCreateWardenForm({ ...createWardenForm, lastName: e.target.value })}
                  placeholder="e.g. Warden"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Username"
                  value={createWardenForm.username || ''}
                  onChange={(e) => setCreateWardenForm({ ...createWardenForm, username: e.target.value })}
                  placeholder="e.g. john.warden"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={createWardenForm.email || ''}
                  onChange={(e) => setCreateWardenForm({ ...createWardenForm, email: e.target.value })}
                  placeholder="e.g. john.warden@ahrao.edu"
                  required
                />
              </div>
              <Input
                label="Password"
                type="password"
                value={createWardenForm.password || ''}
                onChange={(e) => setCreateWardenForm({ ...createWardenForm, password: e.target.value })}
                placeholder="Strong password"
                required
              />
            </>
          )}

          <div className="border-t border-[#2A2E3D] pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Employee ID"
                value={createWardenForm.employeeId}
                onChange={(e) => setCreateWardenForm({ ...createWardenForm, employeeId: e.target.value })}
                placeholder="e.g. WRD-001"
                required
              />
              <Input
                label="Emergency Contact Phone"
                value={createWardenForm.contactNumber}
                onChange={(e) => setCreateWardenForm({ ...createWardenForm, contactNumber: e.target.value })}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateWardenOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Saving...' : 'Provision Warden'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 8: EDIT WARDEN                                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditWardenOpen}
        onClose={() => setIsEditWardenOpen(false)}
        title={`Edit Warden: ${editingWarden?.employeeId}`}
      >
        <form onSubmit={handleSubmitEditWarden} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={editWardenForm.firstName || ''}
              onChange={(e) => setEditWardenForm({ ...editWardenForm, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={editWardenForm.lastName || ''}
              onChange={(e) => setEditWardenForm({ ...editWardenForm, lastName: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={editWardenForm.email || ''}
              onChange={(e) => setEditWardenForm({ ...editWardenForm, email: e.target.value })}
              required
            />
            <Input
              label="Contact Phone"
              value={editWardenForm.contactNumber || ''}
              onChange={(e) => setEditWardenForm({ ...editWardenForm, contactNumber: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditWardenOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Saving...' : 'Update Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 9: MANAGE WARDEN HOSTEL ASSIGNMENTS (Section 9)                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAssignHostelsOpen}
        onClose={() => setIsAssignHostelsOpen(false)}
        title={`Hostel Assignments: ${editingWarden?.firstName} ${editingWarden?.lastName}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Select one or more hostel residential blocks to be supervised by this Warden. Assignments are managed
            relationally through the institutional hostel registry.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
            {referenceData?.hostels.map((hostel) => {
              const isSelected = selectedWardenHostelIds.includes(hostel.id);
              return (
                <div
                  key={hostel.id}
                  onClick={() => handleToggleHostelSelection(hostel.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500/40 text-white shadow-md'
                      : 'bg-[#171A23] border-[#2A2E3D] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Home className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                    <div>
                      <p className="font-semibold text-sm">{hostel.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Code: {hostel.code} • Type: {hostel.type}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-teal-500 border-teal-400 text-black' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#171A23] p-3 rounded-xl border border-[#2A2E3D] text-xs text-slate-400 flex items-center justify-between">
            <span>
              Total Assigned Blocks: <strong className="text-teal-400">{selectedWardenHostelIds.length}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWardenHostelIds([])}
              className="text-xs border-slate-700 hover:bg-slate-800 text-slate-400"
            >
              Clear All
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2E3D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAssignHostelsOpen(false)}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmitAssignHostels}
              disabled={isSubmittingForm}
              className="bg-teal-500 hover:bg-teal-600 text-black font-semibold"
            >
              {isSubmittingForm ? 'Saving...' : 'Save Assignments'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 10: STAFF DETAILS (Section 10)                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Institutional Staff Profile"
      >
        {loadingDetails || !detailsData ? (
          <div className="py-12 flex justify-center text-teal-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            {/* Identity Header */}
            <div className="p-4 rounded-xl bg-[#171A23] border border-[#2A2E3D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {detailsData.fullName || `${detailsData.firstName || ''} ${detailsData.lastName || ''}`.trim() || detailsData.facultyName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Employee ID: <span className="text-teal-400">{detailsData.employeeId}</span>
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  detailsData.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {detailsData.status}
              </span>
            </div>

            {/* Account & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#171A23] border border-[#2A2E3D]">
              <div>
                <span className="text-xs text-slate-500 uppercase block">System Username</span>
                <span className="text-slate-200 font-medium">@{detailsData.username}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase block">Official Email</span>
                <span className="text-slate-200 font-medium">{detailsData.email || detailsData.facultyEmail}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase block">Contact Phone</span>
                <span className="text-slate-200 font-medium">
                  {detailsData.phone || detailsData.contactNumber || detailsData.facultyPhone || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase block">User Account Status</span>
                <span className="text-slate-200 font-medium">{detailsData.userStatus || 'ACTIVE'}</span>
              </div>
            </div>

            {/* Role Specific Section */}
            {detailsType === 'faculty' && (
              <div className="p-4 rounded-xl bg-[#171A23] border border-[#2A2E3D] space-y-2">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Academic Appointment</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Department:</span>
                    <span className="text-slate-200 font-semibold">{detailsData.departmentName} ({detailsData.departmentCode})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Designation:</span>
                    <span className="text-slate-200 font-semibold">{detailsData.designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Qualification:</span>
                    <span className="text-slate-200">{detailsData.qualification || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Appointment Date:</span>
                    <span className="text-slate-200">{detailsData.joiningDate || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {detailsType === 'hod' && (
              <div className="p-4 rounded-xl bg-[#171A23] border border-[#2A2E3D] space-y-2">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">HOD Assignment Terms</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Department:</span>
                    <span className="text-slate-200 font-semibold">{detailsData.departmentName} ({detailsData.departmentCode})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Appointment Start:</span>
                    <span className="text-slate-200">{detailsData.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Appointment End:</span>
                    <span className="text-slate-200">{detailsData.endDate || 'Present'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Faculty Rank:</span>
                    <span className="text-slate-200">{detailsData.designation || 'Professor'}</span>
                  </div>
                </div>
              </div>
            )}

            {detailsType === 'principal' && (
              <div className="p-4 rounded-xl bg-[#171A23] border border-[#2A2E3D] space-y-2">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Principal Executive Office</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Institution:</span>
                    <span className="text-slate-200 font-semibold">{detailsData.institutionName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department of Origin:</span>
                    <span className="text-slate-200">{detailsData.departmentName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tenure Start:</span>
                    <span className="text-slate-200">{detailsData.startDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tenure End:</span>
                    <span className="text-slate-200">{detailsData.endDate || 'Active Indefinite'}</span>
                  </div>
                </div>
              </div>
            )}

            {detailsType === 'warden' && (
              <div className="p-4 rounded-xl bg-[#171A23] border border-[#2A2E3D] space-y-2">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Supervised Hostels</h4>
                {detailsData.assignedHostels && detailsData.assignedHostels.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {detailsData.assignedHostels.map((h: any) => (
                      <div key={h.id} className="p-2 rounded-lg bg-[#11141C] border border-[#2A2E3D] text-xs">
                        <p className="font-semibold text-white">{h.name}</p>
                        <p className="text-slate-500">Code: {h.code} • {h.type}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-400 italic">No hostels currently assigned to this warden.</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDetailsModalOpen(false)}
                className="border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* CONFIRM STATUS TOGGLE DIALOG                                              */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        title={`Confirm Status Transition: ${pendingStatusChange?.nextStatus}`}
        description={`Are you sure you want to change the status of ${pendingStatusChange?.name} to ${pendingStatusChange?.nextStatus}? Associated historical associations and audit trail entries will be preserved safely.`}
        confirmText={isSubmittingStatus ? 'Updating...' : `Confirm ${pendingStatusChange?.nextStatus}`}
        cancelText="Cancel"
        onConfirm={handleConfirmStatusChange}
        onClose={() => {
          setIsStatusConfirmOpen(false);
          setPendingStatusChange(null);
        }}
      />
    </div>
  );
};
