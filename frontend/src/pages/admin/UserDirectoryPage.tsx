import React, { useState } from 'react';
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
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAuth } from '../../hooks/useAuth';
import { UserSummary } from '../../types/auth';
import { CreateUserData, UpdateUserData } from '../../services/api/adminUserApi';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit3,
  RefreshCw,
  Mail,
  Phone,
  Eye,
  Lock,
  Calendar,
  Shield,
  Clock,
} from 'lucide-react';

export const UserDirectoryPage: React.FC = () => {
  const { user: currentAuthUser } = useAuth();

  const {
    users,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    roleFilter,
    statusFilter,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setPage,
    refresh,
    createUser,
    updateUser,
    updateStatus,
    updateRoles,
    resetPassword,
  } = useAdminUsers(20);

  // Feedback Toast state
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  // ConfirmDialog State for Status Changes
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [pendingStatusTarget, setPendingStatusTarget] = useState<{ user: UserSummary; nextStatus: string } | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Create User Form State
  const [newUserForm, setNewUserForm] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roles: ['STUDENT'],
    status: 'ACTIVE',
  });

  // Edit User Form State
  const [editUserForm, setEditUserForm] = useState<UpdateUserData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Manage Roles State
  const [editRoles, setEditRoles] = useState<string[]>([]);

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');

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
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger">Suspended</Badge>;
      case 'INACTIVE':
        return <Badge variant="gray">Inactive</Badge>;
      case 'PENDING':
        return <Badge variant="orange">Pending</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  // Role Badge Mapper
  const renderRoleBadge = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return <Badge variant="purple">ADMIN</Badge>;
      case 'PRINCIPAL':
        return <Badge variant="blue">PRINCIPAL</Badge>;
      case 'HOD':
        return <Badge variant="teal">HOD</Badge>;
      case 'FACULTY':
        return <Badge variant="orange">FACULTY</Badge>;
      case 'WARDEN':
        return <Badge variant="purple">WARDEN</Badge>;
      case 'STUDENT':
      default:
        return <Badge variant="teal">STUDENT</Badge>;
    }
  };

  // Handlers
  const handleOpenStatusConfirm = (user: UserSummary, nextStatus: string) => {
    setPendingStatusTarget({ user, nextStatus });
    setIsStatusConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusTarget) return;
    setIsSubmittingAction(true);
    try {
      await updateStatus(pendingStatusTarget.user.id, pendingStatusTarget.nextStatus);
      showToast(`User @${pendingStatusTarget.user.username} status updated to ${pendingStatusTarget.nextStatus}`);
      setIsStatusConfirmOpen(false);
      setPendingStatusTarget(null);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAction(true);
    try {
      const created = await createUser(newUserForm);
      showToast(`User @${created.username} created successfully`);
      setIsCreateModalOpen(false);
      setNewUserForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        roles: ['STUDENT'],
        status: 'ACTIVE',
      });
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenEdit = (user: UserSummary) => {
    setSelectedUser(user);
    setEditUserForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmittingAction(true);
    try {
      await updateUser(selectedUser.id, editUserForm);
      showToast(`Profile updated for @${selectedUser.username}`);
      setIsEditModalOpen(false);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenRoles = (user: UserSummary) => {
    setSelectedUser(user);
    setEditRoles(user.roles || []);
    setIsRolesModalOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    if (editRoles.length === 0) {
      showToast('At least one role must be assigned', 'error');
      return;
    }
    setIsSubmittingAction(true);
    try {
      await updateRoles(selectedUser.id, editRoles);
      showToast(`Roles updated for @${selectedUser.username}`);
      setIsRolesModalOpen(false);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenResetPassword = (user: UserSummary) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPwdModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    setIsSubmittingAction(true);
    try {
      await resetPassword(selectedUser.id, newPassword);
      showToast(`Password successfully reset for @${selectedUser.username}`);
      setIsResetPwdModalOpen(false);
      setNewPassword('');
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleOpenDetails = (user: UserSummary) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const isSelf = (username: string) => {
    return currentAuthUser?.username?.toLowerCase() === username.toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all border bg-[#11141C] text-sm animate-in fade-in slide-in-from-top-4 border-white/10">
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
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">User Management</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Manage system accounts, roles and account status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            isLoading={loading}
            className="flex items-center gap-1.5"
            title="Refresh user list from database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Filtered</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalElements}</div>
          <div className="text-[11px] text-gray-400 mt-1">Across 6 institutional roles</div>
        </Card>

        <Card className="p-4 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active (Page)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Authorized for JWT session</div>
        </Card>

        <Card className="p-4 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Suspended (Page)</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-300">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            {users.filter((u) => u.status === 'SUSPENDED').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Authentication locked</div>
        </Card>

        <Card className="p-4 bg-[#11141C] border-[#1E2330]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inactive / Pending</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {users.filter((u) => u.status === 'INACTIVE' || u.status === 'PENDING').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Dormant or awaiting activation</div>
        </Card>
      </div>

      {/* Toolbar: Search, Filters, Clear */}
      <Card className="p-4 bg-[#11141C] border-[#1E2330]">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, email, first name, last name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#171A23] border border-white/10 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#171A23] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PRINCIPAL">PRINCIPAL</option>
              <option value="HOD">HOD</option>
              <option value="FACULTY">FACULTY</option>
              <option value="STUDENT">STUDENT</option>
              <option value="WARDEN">WARDEN</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#171A23] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PENDING">PENDING</option>
            </select>

            {(search || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="text-gray-400 hover:text-white shrink-0"
                title="Clear all filters"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error state alert */}
      {error && (
        <ErrorMessage
          type="error"
          title="Failed to Load Users"
          message={error}
          onDismiss={() => refresh()}
        />
      )}

      {/* User Table Card */}
      <Card className="overflow-hidden bg-[#11141C] border-[#1E2330]">
        {loading && users.length === 0 ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={6} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState
              preset="no-search-results"
              title="No users found"
              description={
                search || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No user records match your search or filter criteria. Try clearing your filters.'
                  : 'No user accounts are registered in the database.'
              }
              actionLabel={search || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? 'Clear Filters' : 'Add User'}
              onAction={
                search || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? () => {
                      setSearch('');
                      setRoleFilter('ALL');
                      setStatusFilter('ALL');
                    }
                  : () => setIsCreateModalOpen(true)
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#141822] text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {users.map((user) => {
                  const self = isSelf(user.username);
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Full Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-100 flex items-center gap-1.5">
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                          {self && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                              You
                            </span>
                          )}
                        </div>
                        {user.phone && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-teal-400">@{user.username}</span>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="text-gray-300 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </td>

                      {/* Role(s) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r) => <span key={r}>{renderRoleBadge(r)}</span>)
                          ) : (
                            <span className="text-gray-500 text-[11px]">None</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{renderStatusBadge(user.status)}</td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-gray-300 text-[11px]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {user.lastLoginAt ? `Login ${new Date(user.lastLoginAt).toLocaleDateString()}` : 'Never logged in'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(user)}
                            title="View Full Profile Details"
                            className="p-1.5 rounded-lg bg-[#171A23] hover:bg-[#222838] text-gray-300 border border-white/5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit User Profile */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            title="Edit User Profile"
                            className="p-1.5 rounded-lg bg-[#171A23] hover:bg-[#222838] text-teal-300 border border-white/5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Manage Roles */}
                          <button
                            type="button"
                            onClick={() => handleOpenRoles(user)}
                            title="Manage Assigned Roles"
                            className="p-1.5 rounded-lg bg-[#171A23] hover:bg-[#222838] text-indigo-300 border border-white/5 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Status */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                              handleOpenStatusConfirm(user, nextStatus);
                            }}
                            title={user.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              user.status === 'ACTIVE'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {user.status === 'ACTIVE' ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetPassword(user)}
                            title="Reset User Password"
                            className="p-1.5 rounded-lg bg-[#171A23] hover:bg-[#222838] text-purple-300 border border-white/5 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-white/5 bg-[#141822]">
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
      {/* MODAL 1: ADD USER                                                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision New Institutional Account"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <p className="text-xs text-gray-400">
            Create an account with role-based access. Passwords are encrypted with BCrypt before persistence.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="e.g. Margaret"
              value={newUserForm.firstName}
              onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              placeholder="e.g. Sterling"
              value={newUserForm.lastName}
              onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Username"
              placeholder="e.g. m_sterling"
              value={newUserForm.username}
              onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
              required
            />
            <Input
              label="Institutional Email"
              type="email"
              placeholder="e.g. sterling@ahrao.edu"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Initial Password"
              type="password"
              placeholder="Min. 6 characters"
              value={newUserForm.password}
              onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              required
            />
            <Input
              label="Phone Number (Optional)"
              placeholder="e.g. +91 98765 43210"
              value={newUserForm.phone || ''}
              onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Primary Role"
              value={newUserForm.roles[0] || 'STUDENT'}
              onChange={(e) => setNewUserForm({ ...newUserForm, roles: [e.target.value] })}
              options={[
                { value: 'STUDENT', label: 'STUDENT — Academic & hostel access' },
                { value: 'FACULTY', label: 'FACULTY — Teaching & timetable access' },
                { value: 'HOD', label: 'HOD — Departmental management' },
                { value: 'PRINCIPAL', label: 'PRINCIPAL — Institution-level oversight' },
                { value: 'WARDEN', label: 'WARDEN — Hostel & block management' },
                { value: 'ADMIN', label: 'ADMIN — Full system administration' },
              ]}
              required
            />
            <Select
              label="Initial Status"
              value={newUserForm.status || 'ACTIVE'}
              onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE — Can authenticate immediately' },
                { value: 'PENDING', label: 'PENDING — Awaiting approval/review' },
                { value: 'INACTIVE', label: 'INACTIVE — Dormant account' },
              ]}
              required
            />
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
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT USER PROFILE                                                */}
      {/* ========================================================================= */}
      {selectedUser && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Profile: @${selectedUser.username}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={editUserForm.firstName}
                onChange={(e) => setEditUserForm({ ...editUserForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={editUserForm.lastName}
                onChange={(e) => setEditUserForm({ ...editUserForm, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Institutional Email"
              type="email"
              value={editUserForm.email}
              onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              required
            />

            <Input
              label="Phone Number"
              placeholder="+91 98765 00000"
              value={editUserForm.phone || ''}
              onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
            />

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
      {/* MODAL 3: MANAGE ROLES                                                     */}
      {/* ========================================================================= */}
      {selectedUser && (
        <Modal
          isOpen={isRolesModalOpen}
          onClose={() => setIsRolesModalOpen(false)}
          title={`Assign Roles: @${selectedUser.username}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              Select one or more institutional roles for this account. Note: Removing the last active ADMIN or removing your own admin privileges is protected and prevented.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: 'ADMIN', desc: 'Full system administration' },
                { name: 'PRINCIPAL', desc: 'Institution oversight & approvals' },
                { name: 'HOD', desc: 'Department & timetable allocation' },
                { name: 'FACULTY', desc: 'Teaching schedules & requests' },
                { name: 'STUDENT', desc: 'Course registration & hostel' },
                { name: 'WARDEN', desc: 'Residential block governance' },
              ].map((r) => {
                const isChecked = editRoles.includes(r.name);
                return (
                  <label
                    key={r.name}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                        : 'bg-[#171A23] border-white/5 text-gray-400 hover:bg-[#222838]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditRoles([...editRoles, r.name]);
                        } else {
                          setEditRoles(editRoles.filter((role) => role !== r.name));
                        }
                      }}
                      className="mt-0.5 rounded text-teal-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-mono font-bold text-gray-200 block">{r.name}</span>
                      <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">{r.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRolesModalOpen(false)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveRoles}
                isLoading={isSubmittingAction}
              >
                Apply Roles
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: USER DETAILS MODAL                                               */}
      {/* ========================================================================= */}
      {selectedUser && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Account Security & Identity Details"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#171A23] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-300 flex items-center justify-center font-bold text-sm font-mono">
                {selectedUser.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {selectedUser.firstName} {selectedUser.lastName}
                </div>
                <div className="text-xs text-teal-400 font-mono">@{selectedUser.username}</div>
              </div>
              <div>{renderStatusBadge(selectedUser.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#171A23] border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">User ID</span>
                <span className="font-mono text-gray-200 mt-1 block">#{selectedUser.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#171A23] border border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Phone</span>
                <span className="text-gray-200 mt-1 block">{selectedUser.phone || 'Not configured'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#171A23] border border-white/5 text-xs">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold mb-1">
                Institutional Email
              </span>
              <span className="text-gray-200 font-mono">{selectedUser.email}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#171A23] border border-white/5 text-xs">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold mb-1.5">
                Assigned Roles ({selectedUser.roles?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.roles?.map((r) => (
                  <span key={r}>{renderRoleBadge(r)}</span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#171A23] border border-white/5 text-xs">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold mb-1.5">
                Effective Granted Permissions ({selectedUser.permissions?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                  selectedUser.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-gray-300 border border-white/5"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-[11px]">No fine-grained permissions attached</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>Created {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {selectedUser.lastLoginAt
                    ? `Last login ${new Date(selectedUser.lastLoginAt).toLocaleDateString()}`
                    : 'Never logged in'}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-white/5">
              <Button variant="outline" size="sm" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RESET PASSWORD                                                   */}
      {/* ========================================================================= */}
      {selectedUser && (
        <Modal
          isOpen={isResetPwdModalOpen}
          onClose={() => setIsResetPwdModalOpen(false)}
          title={`Reset Password: @${selectedUser.username}`}
          maxWidth="sm"
        >
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Enter a new secure password for{' '}
              <span className="text-teal-300 font-semibold">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>
              . The credential will be hashed via BCrypt and the action logged in the audit journal.
            </p>

            <Input
              label="New Password"
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsResetPwdModalOpen(false)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingAction}>
                Confirm Password Reset
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM DIALOG: STATUS CHANGE (SUSPEND / ACTIVATE / DEACTIVATE)             */}
      {/* ========================================================================= */}
      {pendingStatusTarget && (
        <ConfirmDialog
          isOpen={isStatusConfirmOpen}
          onClose={() => {
            setIsStatusConfirmOpen(false);
            setPendingStatusTarget(null);
          }}
          onConfirm={handleConfirmStatusChange}
          isLoading={isSubmittingAction}
          variant={pendingStatusTarget.nextStatus === 'ACTIVE' ? 'primary' : 'danger'}
          title={
            pendingStatusTarget.nextStatus === 'ACTIVE'
              ? `Reactivate @${pendingStatusTarget.user.username}?`
              : `Suspend Account @${pendingStatusTarget.user.username}?`
          }
          description={
            pendingStatusTarget.nextStatus === 'ACTIVE'
              ? `This user will regain active authorization and will be permitted to authenticate with their credentials.`
              : `This user will be immediately locked out. Active sessions will be terminated and authentication attempts will fail with 401 Unauthorized.`
          }
          confirmText={pendingStatusTarget.nextStatus === 'ACTIVE' ? 'Reactivate Account' : 'Suspend Account'}
        />
      )}
    </div>
  );
};
