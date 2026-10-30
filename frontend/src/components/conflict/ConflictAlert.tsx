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
        className={`flex items-start gap-3 rounded border border-[#B6D1C1] bg-[#F0F5F2] p-4 text-[#3F7655] ${className}`}
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#3F7655] mt-0.5" />
        <div>
          <h4 className="font-serif font-bold text-[#3F7655]">Constraint Verification Passed</h4>
          <p className="mt-1 text-sm text-[#3F7655]/90">
            No scheduling, double-booking, capacity, or scoping conflicts detected. This resource can be allocated safely.
          </p>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div
        className={`flex items-start gap-3 rounded border border-[#ECC0C0] bg-[#FBF0F0] p-4 text-[#B44747] ${className}`}
      >
        <AlertCircle className="h-5 w-5 shrink-0 text-[#B44747] mt-0.5" />
        <div>
          <h4 className="font-serif font-bold text-[#B44747]">
            Allocation Blocked — {errorCount} Critical Conflict{errorCount > 1 ? 's' : ''} Detected
          </h4>
          <p className="mt-1 text-sm text-[#B44747]/90">
            Resource cannot be allocated because critical business or physical constraints are violated. Final allocation is blocked until these conflicts are resolved.
          </p>
        </div>
      </div>
    );
  }

  if (warningCount > 0) {
    return (
      <div
        className={`flex items-start gap-3 rounded border border-[#E8DEC8] bg-[#FAF7F0] p-4 text-[#A87928] ${className}`}
      >
        <AlertTriangle className="h-5 w-5 shrink-0 text-[#A87928] mt-0.5" />
        <div>
          <h4 className="font-serif font-bold text-[#A87928]">
            Constraint Advisory — {warningCount} Warning{warningCount > 1 ? 's' : ''}
          </h4>
          <p className="mt-1 text-sm text-[#A87928]/90">
            Resource can be allocated, but review the warnings below before confirming.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 rounded border border-[#C2D1DD] bg-[#EFF3F6] p-4 text-[#657C91] ${className}`}
    >
      <Info className="h-5 w-5 shrink-0 text-[#657C91] mt-0.5" />
      <div>
        <h4 className="font-serif font-bold text-[#657C91]">Constraint Information</h4>
        <p className="mt-1 text-sm text-[#657C91]/90">
          Review the informational notes below for this allocation request.
        </p>
      </div>
    </div>
  );
};
