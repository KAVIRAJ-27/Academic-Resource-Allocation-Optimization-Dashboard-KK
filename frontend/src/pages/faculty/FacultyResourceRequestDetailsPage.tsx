import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../../components/layout';
import { Alert, Badge, Button, EmptyState } from '../../components/ui';
import { FacultyRequestCancelModal } from '../../components/faculty/requests/FacultyRequestCancelModal';
import { useFacultyResourceRequestDetails } from '../../hooks/useFacultyResourceRequestDetails';
import {
  FileText,
  Calendar,
  Clock,
  Building2,
  BookOpen,
  User,
  ArrowLeft,
  Ban,
  MapPin,
  Users,
  CheckCircle2,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const FacultyResourceRequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = id ? parseInt(id, 10) : null;

  const {
    request,
    loading,
    error,
    cancelling,
    cancelError,
    cancelRequest,
    refetch,
  } = useFacultyResourceRequestDetails(numericId);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    const success = await cancelRequest();
    if (success) {
      setIsCancelModalOpen(false);
      setSuccessMessage('Resource request has been successfully cancelled.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="blue">Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return <Badge variant="danger">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="orange">High Priority</Badge>;
      case 'MEDIUM':
        return <Badge variant="blue">Medium Priority</Badge>;
      case 'LOW':
        return <Badge variant="gray">Low Priority</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
          <div className="h-8 bg-gray-800 rounded w-64" />
          <div className="h-4 bg-gray-800 rounded w-96 mb-8" />
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-48" />
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-64" />
        </div>
      </PageContainer>
    );
  }

  if (error || !request) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/faculty/resource-requests')}
            className="border-slate-200 text-gray-300 hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Requests
          </Button>

          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-card">
            <EmptyState
              icon={AlertCircle}
              title="Unable to load request details"
              description={error || 'The requested resource requisition could not be found or you do not have permission to view it.'}
              actionLabel="Return to Request List"
              onAction={() => navigate('/faculty/resource-requests')}
            />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Resource Request #${request.id}`}
        description={`Submitted on ${new Date(request.createdAt).toLocaleDateString()} for ${request.purpose}`}
        secondaryAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/faculty/resource-requests')}
              className="border-slate-200 text-gray-300 hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              All Requests
            </Button>
            {request.cancellable && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                Cancel Request
              </Button>
            )}
          </div>
        }
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {successMessage && (
          <Alert
            variant="success"
            title="Request Cancelled"
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}

        {cancelError && (
          <Alert variant="error" title="Cancellation Error">
            {cancelError}
          </Alert>
        )}

        {/* Status Card Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">Lifecycle Status</span>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{request.purpose}</h2>
              {getStatusBadge(request.status)}
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Priority Level</span>
              <div className="mt-1">{getPriorityBadge(request.priority)}</div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Resource Details & Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Facility Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Building2 className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-semibold text-slate-900">Requested Resource</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Resource Name:</span>
                <span className="font-semibold text-white">{request.resourceName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resource Code:</span>
                <span className="font-mono text-teal-400">{request.resourceCode || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-gray-200">{request.resourceCategoryName || 'General Facility'}</span>
              </div>
              {request.resourceLocation && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Location / Floor:</span>
                  <span className="text-gray-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {request.resourceLocation}
                  </span>
                </div>
              )}
              {request.resourceCapacity && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-gray-200 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {request.resourceCapacity} seats
                  </span>
                </div>
              )}
              {request.departmentName && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Administering Dept:</span>
                  <span className="text-gray-300">{request.departmentName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Requested Quantity:</span>
                <span className="font-semibold text-white">{request.quantity} unit(s)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Schedule & Time Window */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-900">Date & Schedule</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Requested Date:</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {request.requestedDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Window:</span>
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {request.startTime?.substring(0, 5)} - {request.endTime?.substring(0, 5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Submission Date:</span>
                <span className="text-gray-300">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
              {request.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-gray-400">
                    {new Date(request.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Context (if associated) */}
        {(request.subjectName || request.subjectCode) && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-900">Academic Curriculum Context</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Associated Subject:</span>
                <span className="font-semibold text-white">
                  {request.subjectCode ? `${request.subjectCode} - ` : ''}
                  {request.subjectName}
                </span>
              </div>
              {request.sectionName && (
                <div>
                  <span className="text-gray-400 block mb-1">Class Section:</span>
                  <Badge variant="purple" size="sm">
                    {request.sectionName}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description / Special Notes */}
        {request.description && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-900">Purpose Description & Special Instructions</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {request.description}
            </p>
          </div>
        )}

        {/* Requester Identity (Auditable Verification) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <User className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-slate-900">Requester Identity</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Faculty Member</span>
              <span className="font-semibold text-white">{request.requesterName || 'Faculty'}</span>
            </div>
            {request.requesterEmployeeId && (
              <div>
                <span className="text-gray-400 block mb-0.5">Employee ID</span>
                <span className="font-mono text-teal-400">{request.requesterEmployeeId}</span>
              </div>
            )}
            <div>
              <span className="text-gray-400 block mb-0.5">Email</span>
              <span className="text-gray-300">{request.requesterEmail || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {request && (
        <FacultyRequestCancelModal
          request={request as any}
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          loading={cancelling}
        />
      )}
    </PageContainer>
  );
};
