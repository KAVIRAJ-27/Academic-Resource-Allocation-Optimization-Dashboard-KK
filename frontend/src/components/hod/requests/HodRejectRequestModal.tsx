import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { HodResourceRequestSummary, HodResourceRequestDetail } from '../../../types/hod';
import { XCircle, AlertTriangle } from 'lucide-react';

interface HodRejectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: HodResourceRequestSummary | HodResourceRequestDetail | null;
  loading: boolean;
  onConfirm: (reason: string) => Promise<void>;
}

export const HodRejectRequestModal: React.FC<HodRejectRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  loading,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!request) return null;

  const handleReject = async () => {
    if (!reason.trim()) {
      setValidationError('A rejection reason is mandatory when declining a request.');
      return;
    }
    setValidationError('');
    await onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decline Resource Request"
      description={`Decline departmental booking for Request #${request.id}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="border-gray-700 hover:bg-gray-800 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReject}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl"
          >
            {loading ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Declining...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <XCircle className="w-4 h-4" />
                <span>Confirm Decline</span>
              </span>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start space-x-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Rejection Notice</p>
            <p className="mt-0.5">
              Declining this request transitions its status to{' '}
              <strong className="text-white font-mono">REJECTED</strong>. The requester will see the reason you provide below.
            </p>
          </div>
        </div>

        {/* Summary Details */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Requester:</span>
            <span className="font-semibold text-white">{request.requesterName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Resource:</span>
            <span className="font-semibold text-white">
              {request.requestedResourceName || 'Unassigned'} {request.requestedResourceCode ? `(${request.requestedResourceCode})` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date & Time:</span>
            <span className="font-semibold text-gray-200">
              {request.requestedDate} ({request.startTime} - {request.endTime})
            </span>
          </div>
        </div>

        {/* Mandatory Reason */}
        <div>
          <label className="block text-xs font-semibold text-gray-200 mb-1.5">
            Reason for Decline <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Please specify why this resource request cannot be accommodated (e.g., Scheduled maintenance, curriculum exam clash, insufficient capacity)..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (validationError) setValidationError('');
            }}
            className={`w-full px-3.5 py-2.5 bg-gray-800/80 border ${
              validationError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-gray-700'
            } rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50`}
          />
          {validationError && (
            <p className="text-[11px] text-rose-400 mt-1">{validationError}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
