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
          className={`inline-flex items-center gap-1.5 rounded bg-[#FBF0F0] text-[#B44747] border border-[#ECC0C0] ${sizeClasses}`}
        >
          <AlertCircle size={iconSize} className="text-[#B44747] shrink-0" />
          <span>{displayLabel}</span>
        </span>
      );
    case 'WARNING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded bg-[#FAF7F0] text-[#A87928] border border-[#E8DEC8] ${sizeClasses}`}
        >
          <AlertTriangle size={iconSize} className="text-[#A87928] shrink-0" />
          <span>{displayLabel}</span>
        </span>
      );
    case 'INFO':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded bg-[#EFF3F6] text-[#657C91] border border-[#C2D1DD] ${sizeClasses}`}
        >
          <Info size={iconSize} className="text-[#657C91] shrink-0" />
          <span>{displayLabel}</span>
        </span>
      );
  }
};
