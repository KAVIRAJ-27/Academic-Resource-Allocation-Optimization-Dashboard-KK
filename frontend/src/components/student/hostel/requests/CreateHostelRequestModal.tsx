import React, { useState } from 'react';
import { Modal, Button, Alert } from '../../../ui';
import { CreateHostelRequestPayload } from '../../../../types/studentHostelRequest';
import { PriorityLevel } from '../../../../types/studentResourceRequest';
import { FilePlus2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateHostelRequestPayload) => Promise<any>;
}

export const CreateHostelRequestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [requestType, setRequestType] = useState<string>('ROOM_CHANGE');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setRequestType('ROOM_CHANGE');
    setPriority('MEDIUM');
    setDescription('');
    setError(null);
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 10) {
      setError('Description must be at least 10 characters long explaining the request.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        requestType,
        priority,
        description: description.trim(),
      });
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit hostel request. Please check that you have an active hostel allocation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Hostel Request"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        {/* Request Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Request Category *
          </label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            disabled={submitting}
            className="w-full px-3 py-2 bg-[#0C0E14] border border-slate-200 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500/50"
          >
            <option value="ROOM_CHANGE">Room Change Request</option>
            <option value="MAINTENANCE">Hostel Maintenance & Repair</option>
            <option value="FACILITY">Hostel Facility / Amenity</option>
            <option value="GENERAL">General Hostel Request</option>
            <option value="OTHER">Other Special Request</option>
          </select>
          <p className="text-[11px] text-gray-500 mt-1">
            Specify the nature of your residential accommodation request.
          </p>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Priority Level *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as PriorityLevel[]).map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  disabled={submitting}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    isSelected
                      ? p === 'URGENT'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : p === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : p === 'MEDIUM'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                      : 'bg-[#0C0E14] text-gray-400 border-slate-200 hover:border-gray-600'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Detailed Justification / Description *
          </label>
          <textarea
            rows={4}
            placeholder="Please provide full details, specific room/bed requirements, or reasons for this request..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            className="w-full px-3 py-2 bg-[#0C0E14] border border-slate-200 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 resize-none"
          />
          <div className="flex justify-between text-[11px] text-gray-500 mt-1">
            <span>Minimum 10 characters</span>
            <span className={description.length < 10 ? 'text-rose-400' : 'text-gray-400'}>
              {description.length} / 2000
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={submitting}
            className="border-slate-200 text-gray-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}
            className="bg-teal-600 hover:bg-teal-500 text-white"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
