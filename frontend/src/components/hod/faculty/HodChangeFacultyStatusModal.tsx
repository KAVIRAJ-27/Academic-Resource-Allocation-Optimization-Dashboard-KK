import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { HodFacultySummary } from '../../../types/hod';
import { AlertTriangle } from 'lucide-react';

interface HodChangeFacultyStatusModalProps {
  faculty: HodFacultySummary | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING', reason?: string) => Promise<void>;
}

export const HodChangeFacultyStatusModal: React.FC<HodChangeFacultyStatusModalProps> = ({
  faculty,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (faculty) {
      setSelectedStatus((faculty.status as any) || 'ACTIVE');
      setReason('');
      setError(null);
    }
  }, [faculty]);

  if (!faculty) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === faculty.status) {
      onClose();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onStatusChange(faculty.id, selectedStatus, reason.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update faculty status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Faculty Account Status" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 text-xs flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">{faculty.fullName}</p>
            <p className="text-gray-400 font-mono text-[11px]">{faculty.employeeId}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block mb-1">Current Status</span>
            <Badge
              variant={
                faculty.status === 'ACTIVE'
                  ? 'success'
                  : faculty.status === 'SUSPENDED'
                  ? 'danger'
                  : 'gray'
              }
            >
              {faculty.status}
            </Badge>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">New Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
          >
            <option value="ACTIVE">ACTIVE — Normal operational status</option>
            <option value="INACTIVE">INACTIVE — On leave or inactive</option>
            <option value="SUSPENDED">SUSPENDED — Access revoked</option>
            <option value="PENDING">PENDING — Awaiting approval</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Reason for Status Change (Audit Logged)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide context for this status modification..."
            rows={2}
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50 resize-none"
          />
        </div>

        {selectedStatus === 'SUSPENDED' && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Suspending this faculty member will temporarily restrict system access for teaching records.
            </span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={loading}>
            Confirm Status Update
          </Button>
        </div>
      </form>
    </Modal>
  );
};
