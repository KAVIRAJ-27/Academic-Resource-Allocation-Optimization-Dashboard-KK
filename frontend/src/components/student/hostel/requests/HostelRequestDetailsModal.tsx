import React, { useState } from 'react';
import { Modal, Button, Alert } from '../../../ui';
import { StudentHostelRequest } from '../../../../types/studentHostelRequest';
import {
  RequestStatusBadge,
  RequestPriorityBadge,
  RequestTypeBadge,
} from './HostelRequestBadges';
import {
  Hotel,
  Calendar,
  Clock,
  Ban,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: StudentHostelRequest | null;
  loading: boolean;
  onCancelRequest?: (id: number) => Promise<any>;
}

export const HostelRequestDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  request,
  loading,
  onCancelRequest,
}) => {
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!request) return null;

  const handleCancel = async () => {
    if (!onCancelRequest) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await onCancelRequest(request.id);
      setShowConfirmCancel(false);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel hostel request');
    } finally {
      setCancelling(false);
    }
  };

  const isCancellable = request.status === 'PENDING';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!cancelling) {
          setShowConfirmCancel(false);
          setCancelError(null);
          onClose();
        }
      }}
      title={`Hostel Request #HR-${String(request.id).padStart(4, '0')}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {cancelError && (
          <Alert variant="error">
            <span>{cancelError}</span>
          </Alert>
        )}

        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#0C0E14] border border-[#1E2330] rounded-xl">
          <div className="flex items-center gap-2">
            <RequestTypeBadge type={request.requestType} />
            <RequestPriorityBadge priority={request.priority} />
          </div>
          <div>
            <RequestStatusBadge status={request.status} />
          </div>
        </div>

        {/* Primary Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Hostel Context */}
          <div className="p-3 bg-[#0C0E14] border border-[#1E2330] rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hotel className="w-3.5 h-3.5 text-teal-400" />
              Hostel Facility
            </span>
            <p className="text-xs font-medium text-white">{request.hostelName || 'General Hostel'}</p>
            {request.roomNumber && (
              <p className="text-[11px] text-gray-400">Current Room: {request.roomNumber}</p>
            )}
          </div>

          {/* Submission Timestamps */}
          <div className="p-3 bg-[#0C0E14] border border-[#1E2330] rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Submission Details
            </span>
            <p className="text-xs text-gray-200">
              {new Date(request.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-[11px] text-gray-400">
              {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="p-4 bg-[#0C0E14] border border-[#1E2330] rounded-xl space-y-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Request Statement & Requirements
          </span>
          <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        </div>

        {/* Cancellation Confirmation Bar */}
        {showConfirmCancel && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Request Cancellation</span>
            </div>
            <p className="text-xs text-gray-300">
              Are you sure you want to cancel this pending hostel request? This action cannot be reversed.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmCancel(false)}
                disabled={cancelling}
                className="border-[#222838] text-gray-300"
              >
                Keep Active
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancel}
                isLoading={cancelling}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1E2330]">
          <div>
            {isCancellable && !showConfirmCancel && onCancelRequest && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmCancel(true)}
                leftIcon={<Ban className="w-3.5 h-3.5" />}
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50"
              >
                Cancel Request
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[#222838] text-gray-300"
          >
            Close Details
          </Button>
        </div>
      </div>
    </Modal>
  );
};
