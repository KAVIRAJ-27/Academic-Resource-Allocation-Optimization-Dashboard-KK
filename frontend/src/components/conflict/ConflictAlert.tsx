import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { ConflictItem } from '../../types/conflict';

interface ConflictAlertProps {
  conflicts: ConflictItem[];
  valid?: boolean;
  className?: string;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({
  conflicts,
  valid,
  className = '',
}) => {
  const errorCount = conflicts.filter((c) => c.severity === 'ERROR').length;
  const warningCount = conflicts.filter((c) => c.severity === 'WARNING').length;
  const hasErrors = errorCount > 0;
  const isAllValid = (valid === true || conflicts.length === 0) && !hasErrors;

  if (isAllValid) {
    return (
      <div
        className={`flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 text-emerald-300 ${className}`}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
        <div>
          <h4 className="font-semibold text-emerald-200">Constraint Verification Passed</h4>
          <p className="mt-1 text-sm text-emerald-400/90">
            No scheduling, double-booking, capacity, or scoping conflicts detected. This resource can be allocated safely.
          </p>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div
        className={`flex items-start gap-3 rounded-lg border border-rose-500/40 bg-rose-950/25 p-4 text-rose-300 ${className}`}
      >
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
        <div>
          <h4 className="font-semibold text-rose-200">
            Allocation Blocked — {errorCount} Critical Conflict{errorCount > 1 ? 's' : ''} Detected
          </h4>
          <p className="mt-1 text-sm text-rose-400/90">
            Resource cannot be allocated because critical business or physical constraints are violated. Final allocation is blocked until these conflicts are resolved.
          </p>
        </div>
      </div>
    );
  }

  if (warningCount > 0) {
    return (
      <div
        className={`flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-950/25 p-4 text-amber-300 ${className}`}
      >
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-200">
            Constraint Advisory — {warningCount} Warning{warningCount > 1 ? 's' : ''}
          </h4>
          <p className="mt-1 text-sm text-amber-400/90">
            Resource can be allocated, but review the warnings below before confirming.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-sky-500/40 bg-sky-950/25 p-4 text-sky-300 ${className}`}
    >
      <Info className="h-5 w-5 shrink-0 text-sky-400 mt-0.5" />
      <div>
        <h4 className="font-semibold text-sky-200">Constraint Information</h4>
        <p className="mt-1 text-sm text-sky-400/90">
          Review the informational notes below for this allocation request.
        </p>
      </div>
    </div>
  );
};
