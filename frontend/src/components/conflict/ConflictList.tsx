import React from 'react';
import { ConflictItem } from '../../types/conflict';
import { ConflictBadge } from './ConflictBadge';
import { Layers, MapPin } from 'lucide-react';

interface ConflictListProps {
  conflicts: ConflictItem[];
  emptyMessage?: string;
}

export const ConflictList: React.FC<ConflictListProps> = ({
  conflicts,
  emptyMessage = 'No conflicts detected.',
}) => {
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="rounded border border-[#E8E0D0] bg-[#FBF9F3] p-4 text-center text-sm text-[#77736A]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {conflicts.map((conflict, index) => {
        const isError = conflict.severity === 'ERROR';
        const isWarning = conflict.severity === 'WARNING';

        const borderColor = isError
          ? 'border-[#ECC0C0] bg-[#FBF0F0]'
          : isWarning
          ? 'border-[#E8DEC8] bg-[#FAF7F0]'
          : 'border-[#C2D1DD] bg-[#EFF3F6]';

        return (
          <div
            key={`${conflict.conflictType}-${conflict.entityId || index}-${index}`}
            className={`rounded border p-3 transition-colors ${borderColor}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ConflictBadge severity={conflict.severity || 'ERROR'} label={conflict.severity || 'ERROR'} size="sm" />
                <span className="font-mono text-xs font-semibold text-[#202020]">
                  {conflict.conflictType}
                </span>
              </div>

              {conflict.entityType && (
                <div className="flex items-center gap-1.5 text-xs text-[#555555] bg-white border border-[#D9D2C3] px-2 py-0.5 rounded">
                  <Layers className="h-3 w-3 text-[#B8A16A]" />
                  <span>
                    {conflict.entityType}
                    {conflict.entityId ? ` #${conflict.entityId}` : ''}
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-sm text-[#202020] font-medium">
              {conflict.message}
            </p>

            {conflict.details && (
              <div className="mt-1 flex items-start gap-1.5 text-xs text-[#77736A]">
                <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-[#77736A]" />
                <span>{conflict.details}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
