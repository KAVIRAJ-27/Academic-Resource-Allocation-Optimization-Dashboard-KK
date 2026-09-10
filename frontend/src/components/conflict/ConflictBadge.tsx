import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ConflictSeverity } from '../../types/conflict';

interface ConflictBadgeProps {
  severity: ConflictSeverity;
  label?: string;
  size?: 'sm' | 'md';
}

export const ConflictBadge: React.FC<ConflictBadgeProps> = ({
  severity,
  label,
  size = 'md',
}) => {
  const displayLabel = label || severity;

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2.5 py-1 text-xs font-semibold';

  const iconSize = size === 'sm' ? 12 : 14;

  switch (severity) {
    case 'ERROR':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 ${sizeClasses}`}
        >
          <AlertCircle size={iconSize} className="text-rose-400 shrink-0" />
          <span>{displayLabel}</span>
        </span>
      );
    case 'WARNING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
        >
          <AlertTriangle size={iconSize} className="text-amber-400 shrink-0" />
          <span>{displayLabel}</span>
        </span>
      );
    case 'INFO':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 ${sizeClasses}`}
        >
          <Info size={iconSize} className="text-sky-400 shrink-0" />
          <span>{displayLabel}</span>
        </span>
      );
  }
};
