import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { HodStudentSummary, HodUpdateStudentRequest, HodStudentReferenceData } from '../../../types/hod';

interface HodEditStudentModalProps {
  student: HodStudentSummary | null;
  referenceData: HodStudentReferenceData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: HodUpdateStudentRequest) => Promise<void>;
}

export const HodEditStudentModal: React.FC<HodEditStudentModalProps> = ({
  student,
  referenceData,
  isOpen,
  onClose,
  onSave,
}) => {
  const [semester, setSemester] = useState<number>(1);
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [rollNumber, setRollNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setSemester(student.currentSemester || 1);
      setRollNumber(student.rollNumber || '');
      setSectionId(student.sectionId || '');
      setError(null);
    }
  }, [student]);

  if (!student) return null;

  // Filter sections belonging to this student's program
  const relevantSections = referenceData?.sections.filter(
    (s) => s.programId === student.programId || s.programCode === student.programCode
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(student.id, {
        currentSemester: Number(semester),
        sectionId: sectionId !== '' ? Number(sectionId) : undefined,
        rollNumber: rollNumber.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update student academic details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Academic Placement" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 text-xs space-y-1">
          <p className="font-semibold text-white">{student.fullName}</p>
          <p className="text-gray-400 font-mono">
            {student.registerNumber} • {student.programName} ({student.programCode})
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Roll Number
          </label>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Class roll number..."
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Current Semester (1-8)
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Assigned Cohort Section
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-purple-500/50"
          >
            <option value="">Select Section</option>
            {relevantSections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name} ({s.programCode})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={loading}>
            Save Placement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
