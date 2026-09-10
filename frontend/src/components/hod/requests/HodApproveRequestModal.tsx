import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { HodResourceRequestSummary, HodResourceRequestDetail } from '../../../types/hod';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface HodApproveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: HodResourceRequestSummary | HodResourceRequestDetail | null;
  loading: boolean;
  onConfirm: (remarks?: string) => Promise<void>;
}

export const HodApproveRequestModal: React.FC<HodApproveRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  loading,
  onConfirm,
}) => {
  const [remarks, setRemarks] = useState('');

  if (!request) return null;

  const handleApprove = async () => {
    await onConfirm(remarks.trim() || undefined);
    setRemarks('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Resource Request"
      description={`Grant departmental approval for Request #${request.id}`}
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
            onClick={handleApprove}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
          >
            {loading ? (
              <span className="flex items-center space-x-1.5">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Approving...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Approval</span>
              </span>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start space-x-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-200">HOD Department Authorization</p>
            <p className="mt-0.5">
              Approving this request authorizes the reservation. The request status will transition to{' '}
              <strong className="text-white font-mono">APPROVED</strong>, an approval audit record will be logged, and the requester will be notified.
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
          <div className="flex justify-between">
            <span className="text-gray-400">Purpose:</span>
            <span className="font-medium text-gray-300 text-right max-w-xs">{request.purpose}</span>
          </div>
        </div>

        {/* Optional Remarks */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Approval Remarks / Conditions (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g., Approved for scheduled lab session. Please ensure equipment is restored."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>
    </Modal>
  );
};
