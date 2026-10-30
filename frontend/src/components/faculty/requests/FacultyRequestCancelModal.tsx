import React from 'react';
import { FacultyResourceRequestItem } from '../../../types/faculty';
import { Modal, Button } from '../../ui';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface FacultyRequestCancelModalProps {
  request: FacultyResourceRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const FacultyRequestCancelModal: React.FC<FacultyRequestCancelModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title="Cancel Resource Request">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Are you sure you want to cancel this request?</p>
            <p className="mt-1 text-rose-300/80">
              This action cannot be undone. Once cancelled, the request will be permanently archived and will not be reviewed by academic administrators.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Request ID:</span>
            <span className="font-mono text-white font-medium">#{request.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Requested Resource:</span>
            <span className="text-white font-medium">{request.resourceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Scheduled Date:</span>
            <span className="text-white">{request.requestedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time Window:</span>
            <span className="text-white">
              {request.startTime?.substring(0, 5)} - {request.endTime?.substring(0, 5)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Purpose:</span>
            <span className="text-gray-300 truncate max-w-[200px]">{request.purpose}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Keep Request
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Cancel Request</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
