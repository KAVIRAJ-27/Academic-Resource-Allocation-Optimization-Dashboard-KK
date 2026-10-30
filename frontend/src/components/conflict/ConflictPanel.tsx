import React from 'react';
import { ConflictItem, ConflictResult } from '../../types/conflict';
import { ConflictAlert } from './ConflictAlert';
import { ConflictList } from './ConflictList';
import { ShieldAlert } from 'lucide-react';

interface ConflictPanelProps {
  conflictResult?: ConflictResult | null;
  conflicts?: ConflictItem[];
  valid?: boolean;
  title?: string;
  className?: string;
}

export const ConflictPanel: React.FC<ConflictPanelProps> = ({
  conflictResult,
  conflicts: rawConflicts,
  valid,
  title = 'Constraint & Conflict Analysis',
  className = '',
}) => {
  // Unify conflicts list
  const activeConflicts: ConflictItem[] = conflictResult?.conflicts || rawConflicts || [];
  const isValid = conflictResult ? conflictResult.valid : (valid !== undefined ? valid : activeConflicts.length === 0);

  return (
    <div className={`space-y-4 rounded-xl border border-[#D8C9A8] bg-white p-5 shadow-none ${className}`}>
      <div className="flex items-center justify-between border-b border-[#E8E0D0] pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[#B8A16A]" />
          <h3 className="font-serif font-bold text-[#202020] text-sm">{title}</h3>
        </div>
        <div className="text-xs text-[#77736A]">
          {activeConflicts.length === 0
            ? '0 conflicts'
            : `${activeConflicts.length} item${activeConflicts.length > 1 ? 's' : ''}`}
        </div>
      </div>

      <ConflictAlert conflicts={activeConflicts} valid={isValid} />

      {activeConflicts.length > 0 && (
        <div className="pt-1">
          <ConflictList conflicts={activeConflicts} />
        </div>
      )}
    </div>
  );
};
