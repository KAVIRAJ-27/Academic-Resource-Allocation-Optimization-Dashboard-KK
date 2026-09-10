import React from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { HodResourceRequestDetail } from '../../../types/hod';
import {
  User,
  Calendar,
  Clock,
  Layers,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';

interface HodRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: HodResourceRequestDetail | null;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export const HodRequestDetailModal: React.FC<HodRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  loading,
  onApprove,
  onReject,
}) => {
  if (!request && !loading) return null;

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'CANCELLED':
        return <Badge variant="gray">CANCELLED</Badge>;
      default:
        return <Badge variant="info">{status || 'UNKNOWN'}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-700/50 text-gray-300 border border-gray-600/30">{priority || 'LOW'}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={request ? `Resource Request #${request.id}` : 'Request Details'}
      description="Detailed inspection of department academic resource booking request"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {request && (
              <>
                <span className="text-xs text-gray-400">Status:</span>
                {getStatusBadge(request.status)}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {request?.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReject}
                  className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject Request
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onApprove}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approve Request
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-700 hover:bg-gray-800 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      }
    >
      {loading || !request ? (
        <div className="py-12 flex items-center justify-center space-x-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading request information...</span>
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Top Banner: Requester & Resource info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Requester Box */}
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                <User className="w-4 h-4" />
                <span>Requester Details</span>
              </div>
              <div>
                <p className="text-base font-bold text-white">{request.requesterName}</p>
                <p className="text-xs text-gray-400">{request.requesterEmail}</p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-800/60">
                <span className="text-xs text-gray-400">Role:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-800 text-gray-200 border border-gray-700">
                  {request.requesterRole || 'Faculty'}
                </span>
                <span className="text-xs text-gray-400 ml-auto">Dept:</span>
                <span className="text-xs font-semibold text-gray-300">{request.departmentName}</span>
              </div>
            </div>

            {/* Resource Box */}
            <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                <Layers className="w-4 h-4" />
                <span>Resource Specification</span>
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  {request.requestedResourceName || 'Unassigned / Generic Request'}
                </p>
                {request.requestedResourceCode && (
                  <p className="text-xs font-mono text-gray-400">{request.requestedResourceCode}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-800/60 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500">Category:</span> {request.categoryName || 'N/A'}
                </div>
                {request.resourceCapacity && (
                  <div>
                    <span className="text-gray-500">Capacity:</span> {request.resourceCapacity} seats
                  </div>
                )}
                {request.resourceLocation && (
                  <div className="col-span-2 flex items-center space-x-1 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>{request.resourceLocation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Timing Box */}
          <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <Calendar className="w-4 h-4" />
              <span>Schedule & Utilization</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Date Requested</p>
                <p className="font-semibold text-white mt-0.5">{request.requestedDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time Slot</p>
                <p className="font-semibold text-white mt-0.5">
                  {request.startTime} - {request.endTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-semibold text-white mt-0.5">{request.quantity} unit(s)</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Priority Level</p>
                <div className="mt-0.5">{getPriorityBadge(request.priority)}</div>
              </div>
            </div>
          </div>

          {/* Academic Context & Purpose */}
          <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <FileText className="w-4 h-4" />
              <span>Purpose & Academic Context</span>
            </div>
            {request.academicSubject && (
              <div className="flex items-center gap-2 text-xs text-gray-300 pb-2 border-b border-gray-800/60">
                <span className="text-gray-500">Subject:</span>
                <strong className="text-indigo-300">{request.academicSubject}</strong>
                {request.academicSection && (
                  <>
                    <span className="text-gray-500 ml-2">Section:</span>
                    <strong className="text-white">{request.academicSection}</strong>
                  </>
                )}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Purpose Description:</p>
              <p className="text-sm text-gray-200 bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                {request.purpose}
              </p>
            </div>
            {request.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Additional Details:</p>
                <p className="text-xs text-gray-300 bg-gray-900/40 p-2.5 rounded-lg border border-gray-800">
                  {request.description}
                </p>
              </div>
            )}
          </div>

          {/* Approval History */}
          <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Approval Audit History</span>
            </div>
            {request.approvalHistory && request.approvalHistory.length > 0 ? (
              <div className="space-y-2">
                {request.approvalHistory.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">
                          Level: {appr.approvalLevel}
                        </span>
                        {getStatusBadge(appr.status)}
                      </div>
                      {appr.approvedByName && (
                        <p className="text-gray-400 mt-1">
                          Reviewed by: <strong className="text-gray-300">{appr.approvedByName}</strong>
                        </p>
                      )}
                      {appr.comments && (
                        <p className="text-gray-300 mt-1 italic bg-gray-800/40 px-2 py-1 rounded">
                          "{appr.comments}"
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {new Date(appr.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No previous approval logs recorded.</p>
            )}
          </div>

          {/* Related Allocation */}
          {request.relatedAllocation && (
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                <CalendarCheck className="w-4 h-4" />
                <span>Associated Resource Allocation</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">
                    Allocation #{request.relatedAllocation.id}: {request.relatedAllocation.resourceName} ({request.relatedAllocation.resourceCode})
                  </p>
                  <p className="text-gray-400 mt-0.5">
                    {new Date(request.relatedAllocation.startDatetime).toLocaleString()} - {new Date(request.relatedAllocation.endDatetime).toLocaleString()}
                  </p>
                </div>
                <Badge variant={request.relatedAllocation.status === 'ACTIVE' ? 'success' : 'info'}>
                  {request.relatedAllocation.status}
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
