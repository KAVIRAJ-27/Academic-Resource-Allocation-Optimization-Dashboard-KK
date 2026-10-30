import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui';
import {
  StudentResourceSummary,
  CreateResourceRequestPayload,
  PriorityLevel,
} from '../../../types/studentResourceRequest';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resources: StudentResourceSummary[];
  resourcesLoading: boolean;
  onSubmit: (payload: CreateResourceRequestPayload) => Promise<any>;
}

export const CreateStudentRequestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  resources,
  resourcesLoading,
  onSubmit,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [resourceId, setResourceId] = useState<number | ''>('');
  const [requestedDate, setRequestedDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [purpose, setPurpose] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [description, setDescription] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected resource detail preview
  const selectedResource = resources.find((r) => r.id === Number(resourceId));

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setResourceId('');
      setRequestedDate(todayStr);
      setStartTime('09:00');
      setEndTime('10:00');
      setPurpose('');
      setPriority('MEDIUM');
      setDescription('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setSubmitting(false);
    }
  }, [isOpen, todayStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!resourceId) {
      setErrorMessage('Please select an eligible academic resource.');
      return;
    }

    if (!requestedDate) {
      setErrorMessage('Please choose a valid request date.');
      return;
    }

    if (requestedDate < todayStr) {
      setErrorMessage('Requested date cannot be in the past.');
      return;
    }

    if (!startTime || !endTime) {
      setErrorMessage('Please specify both start and end times.');
      return;
    }

    if (startTime >= endTime) {
      setErrorMessage('Start time must be earlier than end time.');
      return;
    }

    if (!purpose.trim() || purpose.trim().length < 5) {
      setErrorMessage('Please provide a meaningful purpose (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        resourceId: Number(resourceId),
        requestedDate,
        startTime,
        endTime,
        purpose: purpose.trim(),
        priority,
        description: description.trim() || undefined,
      });

      setSuccessMessage('Resource request submitted successfully! Status is set to PENDING.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit resource request.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => {} : onClose}
      title="Request Academic Resource"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Banner note */}
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-start gap-2.5 text-teal-300 text-xs">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p>
            Academic resource requests are reviewed by department authorities. Submitting a request does
            not directly allocate the venue.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-start gap-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Resource Selection */}
        <div className="space-y-1.5">
          <label className="block font-medium text-gray-300">
            Select Resource <span className="text-rose-400">*</span>
          </label>
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : '')}
            disabled={resourcesLoading || submitting}
            className="w-full bg-slate-50 border border-slate-200 text-gray-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="">-- Choose an available academic resource --</option>
            {resources.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name} ({res.code}) — {res.categoryName || 'General'}
              </option>
            ))}
          </select>
          {resourcesLoading && (
            <p className="text-[11px] text-gray-500">Loading eligible resources...</p>
          )}
        </div>

        {/* Resource Preview Card */}
        {selectedResource && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{selectedResource.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-teal-400 border border-teal-500/30">
                {selectedResource.categoryName || 'Resource'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
              {selectedResource.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span>{selectedResource.location}</span>
                </div>
              )}
              {selectedResource.capacity && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span>Capacity: {selectedResource.capacity} persons</span>
                </div>
              )}
              {selectedResource.departmentName && (
                <div className="flex items-center gap-1.5 col-span-2">
                  <Building2 className="w-3 h-3 text-gray-500" />
                  <span>Dept: {selectedResource.departmentName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Requested Date */}
          <div className="space-y-1.5">
            <label className="block font-medium text-gray-300">
              Required Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                disabled={submitting}
                className="w-full bg-slate-50 border border-slate-200 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Start Time */}
          <div className="space-y-1.5">
            <label className="block font-medium text-gray-300">
              Start Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={submitting}
              className="w-full bg-slate-50 border border-slate-200 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>

          {/* End Time */}
          <div className="space-y-1.5">
            <label className="block font-medium text-gray-300">
              End Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={submitting}
              className="w-full bg-slate-50 border border-slate-200 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Priority & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block font-medium text-gray-300">
              Request Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              disabled={submitting}
              className="w-full bg-slate-50 border border-slate-200 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500/50 transition-colors"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
        </div>

        {/* Purpose */}
        <div className="space-y-1.5">
          <label className="block font-medium text-gray-300">
            Purpose / Academic Justification <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            disabled={submitting}
            placeholder="e.g., Final Year Capstone Project Demonstration & Hardware Benchmarking"
            className="w-full bg-slate-50 border border-slate-200 text-gray-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-teal-500/50 transition-colors resize-none placeholder-gray-500"
          />
        </div>

        {/* Additional Notes (optional) */}
        <div className="space-y-1.5">
          <label className="block font-medium text-gray-400">
            Additional Notes (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            placeholder="e.g., Requires projector and power strips for 4 workstations"
            className="w-full bg-slate-50 border border-slate-200 text-gray-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500/50 transition-colors placeholder-gray-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
            className="border-slate-200 text-gray-300"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            disabled={submitting}
            className="bg-teal-500 hover:bg-teal-400 text-black font-semibold min-w-[150px]"
          >
            {submitting ? 'Submitting request...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
