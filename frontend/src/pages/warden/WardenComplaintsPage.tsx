import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
} from '../../components/layout';
import {
  StatCard,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EmptyState,
} from '../../components/ui';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building,
  User,
  Filter,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { useWardenComplaints } from '../../hooks/useWardenComplaints';
import { HostelScopeSelector } from '../../components/warden/HostelScopeSelector';
import { ComplaintStatus, PriorityLevel, WardenComplaintSummary } from '../../types/wardenOperations';

export const WardenComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hostels, selectedHostelId, selectedHostel, selectHostel, loading: hostelsLoading } =
    useWardenHostels();

  const {
    complaints,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading: complaintsLoading,
    error,
    filters,
    mutating,
    updateFilters,
    resetFilters,
    updateComplaintStatus,
    refetch,
  } = useWardenComplaints({ hostelId: selectedHostelId });

  const [selectedComplaint, setSelectedComplaint] = useState<WardenComplaintSummary | null>(null);
  const [modalStatus, setModalStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHostelId !== filters.hostelId) {
      updateFilters({ hostelId: selectedHostelId });
    }
  }, [selectedHostelId, filters.hostelId, updateFilters]);

  const openStatusModal = (complaint: WardenComplaintSummary) => {
    setSelectedComplaint(complaint);
    setModalStatus(
      complaint.status === 'OPEN'
        ? 'IN_PROGRESS'
        : complaint.status === 'IN_PROGRESS'
        ? 'RESOLVED'
        : 'CLOSED'
    );
    setModalRemarks('');
    setModalError(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    try {
      setModalError(null);
      await updateComplaintStatus(selectedComplaint.id, {
        status: modalStatus,
        remarks: modalRemarks.trim() || undefined,
      });
      setSelectedComplaint(null);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to update complaint status');
    }
  };

  const statusTabs: { key: ComplaintStatus | ''; label: string }[] = [
    { key: '', label: 'All Complaints' },
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger" dot>URGENT</Badge>;
      case 'HIGH':
        return <Badge variant="orange" dot>HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="neutral">LOW</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="danger">OPEN</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">IN PROGRESS</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'CLOSED':
        return <Badge variant="teal">CLOSED</Badge>;
      case 'REJECTED':
        return <Badge variant="neutral">REJECTED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openCount = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Resident Complaints"
        description="Grievance management, status tracking, and student issue resolution across your assigned hostel blocks."
        badge={<Badge variant="orange" dot>WARDEN GRIEVANCES</Badge>}
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${complaintsLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={complaintsLoading}
          >
            Refresh
          </Button>
        }
      />

      {/* 1. HOSTEL SCOPE SELECTOR */}
      <HostelScopeSelector
        hostels={hostels}
        selectedHostelId={selectedHostelId}
        onSelectHostel={selectHostel}
        loading={hostelsLoading}
      />

      {/* 2. STATS OVERVIEW */}
      <ContentSection
        title="Complaint Metrics"
        subtitle="Current status breakdown for complaints in the selected scope"
      >
        <DashboardGrid variant="stats">
          <StatCard
            title="Total Complaints"
            value={totalElements.toString()}
            description="All recorded grievances"
            icon={AlertTriangle}
            badge={<Badge variant="orange">Total</Badge>}
            trend={{ direction: 'neutral', label: 'Database records' }}
            footerText="Scoped to authorized hostels"
          />
          <StatCard
            title="Open / Unassigned"
            value={openCount.toString()}
            description="Requires immediate review"
            icon={Clock}
            badge={<Badge variant="danger">Open</Badge>}
            trend={{ direction: 'neutral', label: 'Action required' }}
            footerText="Prioritize high severity items"
          />
          <StatCard
            title="Under Investigation"
            value={inProgressCount.toString()}
            description="Currently being handled"
            icon={Filter}
            badge={<Badge variant="warning">In Progress</Badge>}
            trend={{ direction: 'neutral', label: 'Active tickets' }}
            footerText="Follow-up with students"
          />
          <StatCard
            title="Resolved / Closed"
            value={resolvedCount.toString()}
            description="Successfully addressed"
            icon={CheckCircle2}
            badge={<Badge variant="teal">Completed</Badge>}
            trend={{ direction: 'neutral', label: 'Resolution nominal' }}
            footerText="Historical closed tickets"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 3. FILTER AND SEARCH BAR */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
              {statusTabs.map((tab) => {
                const isActive = (filters.status || '') === tab.key;
                return (
                  <button
                    key={tab.key || 'ALL'}
                    onClick={() => updateFilters({ status: tab.key as ComplaintStatus || undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input and Priority Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, student..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/60 transition-colors"
                />
              </div>

              <select
                value={filters.priority || ''}
                onChange={(e) => updateFilters({ priority: (e.target.value as PriorityLevel) || undefined })}
                className="bg-slate-900/80 border border-slate-700/70 rounded-lg text-xs text-slate-300 py-2 px-3 focus:outline-none focus:border-orange-500/60"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              {(filters.status || filters.priority || filters.search) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. COMPLAINTS LIST TABLE */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Student Grievance Registry
              </CardTitle>
              <CardDescription>
                {selectedHostel
                  ? `Showing grievances filed for ${selectedHostel.name}`
                  : 'Showing grievances across all assigned hostels'}
              </CardDescription>
            </div>
            <Badge variant="neutral">{totalElements} Tickets Found</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {complaintsLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-3" />
              <p>Loading hostel complaints registry...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No complaints match criteria"
                description="There are currently no reported student grievances matching the selected filters in your hostel blocks."
                icon={CheckCircle2}
                actionLabel={
                  filters.status || filters.priority || filters.search
                    ? 'Reset Filters'
                    : undefined
                }
                onAction={
                  filters.status || filters.priority || filters.search
                    ? resetFilters
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60 bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">ID / Priority</th>
                    <th className="py-3.5 px-4 font-semibold">Student</th>
                    <th className="py-3.5 px-4 font-semibold">Location</th>
                    <th className="py-3.5 px-4 font-semibold">Grievance Title</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Logged Date</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {complaints.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/warden/complaints/${c.id}`)}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">#{c.id}</span>
                          {getPriorityBadge(c.priority)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-700/50">
                            {c.studentName ? c.studentName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200 text-xs">{c.studentName || 'Unknown Student'}</p>
                            <p className="text-[11px] font-mono text-slate-400">{c.registerNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.hostelName}</span>
                          {c.roomNumber && (
                            <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                              Rm {c.roomNumber}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-200 text-xs truncate" title={c.title}>
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{c.category}</p>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Eye className="w-3.5 h-3.5 text-slate-400" />}
                            onClick={() => navigate(`/warden/complaints/${c.id}`)}
                          >
                            Details
                          </Button>
                          {c.status !== 'CLOSED' && c.status !== 'REJECTED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusModal(c)}
                            >
                              Update
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {currentPage + 1} of {totalPages} ({totalElements} total complaints)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QUICK STATUS UPDATE MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Update Complaint #{selectedComplaint.id}
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-xs text-red-300">
                {modalError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Issue Title</label>
                <p className="text-slate-200 font-medium bg-slate-800/60 p-2 rounded-lg border border-slate-700/40">
                  {selectedComplaint.title}
                </p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Current Status</label>
                <div className="mb-2">{getStatusBadge(selectedComplaint.status)}</div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">New Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as ComplaintStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 py-2 px-3 text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="IN_PROGRESS">IN_PROGRESS (Under investigation)</option>
                  <option value="RESOLVED">RESOLVED (Issue resolved)</option>
                  <option value="CLOSED">CLOSED (Formally closed)</option>
                  <option value="REJECTED">REJECTED (Invalid / rejected)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Resolution Notes / Remarks</label>
                <textarea
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Explain steps taken or reason for resolution/rejection..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 p-2.5 text-xs focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
                disabled={mutating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateStatus}
                loading={mutating}
              >
                Confirm Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
