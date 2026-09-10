import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { HodStudentSummary } from '../../../types/hod';
import { AlertTriangle } from 'lucide-react';

interface HodChangeStudentStatusModalProps {
  student: HodStudentSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING', reason?: string) => Promise<void>;
}

export const HodChangeStudentStatusModal: React.FC<HodChangeStudentStatusModalProps> = ({
  student,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'>('ACTIVE');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setSelectedStatus((student.status as any) || 'ACTIVE');
      setReason('');
      setError(null);
    }
  }, [student]);

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === student.status) {
      onClose();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onStatusChange(student.id, selectedStatus, reason.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update student status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Student Enrollment Status" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 text-xs flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">{student.fullName}</p>
            <p className="text-gray-400 font-mono text-[11px]">{student.registerNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block mb-1">Current Status</span>
            <Badge
              variant={
                student.status === 'ACTIVE'
                  ? 'success'
                  : student.status === 'SUSPENDED'
                  ? 'danger'
                  : 'gray'
              }
            >
              {student.status}
            </Badge>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">New Enrollment Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
          >
            <option value="ACTIVE">ACTIVE — Regularly enrolled</option>
            <option value="INACTIVE">INACTIVE — Semester break / gap</option>
            <option value="SUSPENDED">SUSPENDED — Academic suspension</option>
            <option value="PENDING">PENDING — Registration pending</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Reason for Status Change (Audit Logged)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide justification or memo reference for this change..."
            rows={2}
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50 resize-none"
          />
        </div>

        {selectedStatus === 'SUSPENDED' && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Suspending this student blocks academic resource request submissions.
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
