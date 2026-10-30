import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui';
import { StudentResourceRequest } from '../../../types/studentResourceRequest';
import { StudentRequestStatusBadge, StudentRequestPriorityBadge } from './StudentRequestBadges';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  FileText,
  Ban,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: StudentResourceRequest | null;
  loading: boolean;
  error: string | null;
  onCancelRequest: (id: number) => Promise<any>;
}

export const StudentRequestDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  request,
  loading,
  error,
  onCancelRequest,
}) => {
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleClose = () => {
    setConfirmCancel(false);
    setCancelError(null);
    onClose();
  };

  const handleExecuteCancel = async () => {
    if (!request) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await onCancelRequest(request.id);
      setConfirmCancel(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel request';
      setCancelError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const isPending = request?.status === 'PENDING';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={request ? `Resource Request #${request.id}` : 'Request Details'}
      maxWidth="lg"
    >
      {loading ? (
        <div className="py-8 space-y-4 animate-pulse">
          <div className="h-6 w-32 bg-[#1E2330] rounded" />
          <div className="h-20 bg-slate-50 rounded-xl" />
          <div className="h-20 bg-slate-50 rounded-xl" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      ) : !request ? null : (
        <div className="space-y-4 text-xs">
          {/* Header Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-400 font-mono">Current Status</span>
              <div>
                <StudentRequestStatusBadge status={request.status} />
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[11px] text-gray-400 font-mono">Priority</span>
              <div>
                <StudentRequestPriorityBadge priority={request.priority} />
              </div>
            </div>
          </div>

          {/* Cancellation Warning/Error if any */}
          {cancelError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{cancelError}</span>
            </div>
          )}

          {/* Resource Venue Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 text-sm">
                {request.resourceName || 'Academic Resource'}
              </h4>
              {request.resourceCode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-teal-400 border border-teal-500/30">
                  {request.resourceCode}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Category: <strong className="text-white">{request.categoryName || 'General'}</strong>
                </span>
              </div>

              {request.resourceLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Venue: {request.resourceLocation}</span>
                </div>
              )}

              {request.resourceCapacity && (
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Capacity: {request.resourceCapacity} seats</span>
                </div>
              )}

              {request.departmentName && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Dept: {request.departmentName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Time Window */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h5 className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] font-mono">
              Requested Schedule
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Date: <strong className="text-white">{request.requestedDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Time Window: {request.startTime} - {request.endTime}</span>
              </div>
            </div>
          </div>

          {/* Purpose & Notes */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h5 className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] font-mono">
              Academic Purpose & Notes
            </h5>
            <p className="text-white text-xs leading-relaxed">
              {request.purpose}
            </p>
            {request.description && (
              <div className="pt-2 border-t border-slate-200 text-gray-400 text-xs">
                <span className="font-medium text-gray-300">Notes: </span>
                {request.description}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono px-1">
            <span>Submitted: {new Date(request.createdAt).toLocaleString()}</span>
            {request.updatedAt && (
              <span>Updated: {new Date(request.updatedAt).toLocaleString()}</span>
            )}
          </div>

          {/* Cancellation confirmation box */}
          {confirmCancel ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-xs">Confirm Request Cancellation</h5>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">
                    Are you sure you want to cancel this pending request? This request will be permanently
                    marked as CANCELLED.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                  className="border-slate-200 text-gray-300"
                >
                  Keep Request
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="xs"
                  isLoading={cancelling}
                  disabled={cancelling}
                  onClick={handleExecuteCancel}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Yes, Cancel Request
                </Button>
              </div>
            </div>
          ) : null}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div>
              {isPending && !confirmCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmCancel(true)}
                  leftIcon={<Ban className="w-3.5 h-3.5" />}
                  className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                >
                  Cancel Request
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="border-slate-200 text-gray-300"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
