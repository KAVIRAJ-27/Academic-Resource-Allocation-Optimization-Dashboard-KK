import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { HodFacultySummary, HodUpdateFacultyRequest } from '../../../types/hod';

interface HodEditFacultyModalProps {
  faculty: HodFacultySummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: HodUpdateFacultyRequest) => Promise<void>;
}

export const HodEditFacultyModal: React.FC<HodEditFacultyModalProps> = ({
  faculty,
  isOpen,
  onClose,
  onSave,
}) => {
  const [designation, setDesignation] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (faculty) {
      setDesignation(faculty.designation || '');
      setQualification(faculty.qualification || '');
      setSpecialization(faculty.specialization || '');
      setError(null);
    }
  }, [faculty]);

  if (!faculty) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(faculty.id, {
        designation: designation.trim() || undefined,
        qualification: qualification.trim() || undefined,
        specialization: specialization.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update faculty profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Faculty Information" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 text-xs space-y-1">
          <p className="font-semibold text-white">{faculty.fullName}</p>
          <p className="text-gray-400 font-mono">Employee ID: {faculty.employeeId}</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Designation</label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Associate Professor, Assistant Professor"
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Qualification</label>
          <input
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            placeholder="e.g. Ph.D. in Computer Science, M.Tech"
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Specialization</label>
          <input
            type="text"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Distributed Systems, Artificial Intelligence"
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500/50"
          />
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
