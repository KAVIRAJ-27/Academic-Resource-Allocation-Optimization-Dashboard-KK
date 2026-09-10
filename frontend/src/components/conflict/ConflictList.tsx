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
      <div className="rounded-lg border border-border/40 bg-card/30 p-4 text-center text-sm text-muted-foreground">
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
          ? 'border-rose-500/30 bg-rose-950/15'
          : isWarning
          ? 'border-amber-500/30 bg-amber-950/15'
          : 'border-sky-500/30 bg-sky-950/15';

        return (
          <div
            key={`${conflict.conflictType}-${conflict.entityId || index}-${index}`}
            className={`rounded-lg border p-3 transition-colors ${borderColor}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ConflictBadge severity={conflict.severity || 'ERROR'} label={conflict.severity || 'ERROR'} size="sm" />
                <span className="font-mono text-xs font-semibold text-foreground">
                  {conflict.conflictType}
                </span>
              </div>

              {conflict.entityType && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                  <Layers className="h-3 w-3" />
                  <span>
                    {conflict.entityType}
                    {conflict.entityId ? ` #${conflict.entityId}` : ''}
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-sm text-foreground/90 font-medium">
              {conflict.message}
            </p>

            {conflict.details && (
              <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span>{conflict.details}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
