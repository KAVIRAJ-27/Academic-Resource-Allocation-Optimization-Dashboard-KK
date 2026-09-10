export type ConflictSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface ConflictItem {
  conflictType: string;
  severity?: ConflictSeverity;
  entityType?: string;
  entityId?: number;
  message: string;
  details?: string;
  timestamp?: string;
}

export interface ConflictResult {
  valid: boolean;
  severity?: ConflictSeverity;
  canAllocate?: boolean;
  totalConflicts: number;
  conflicts: ConflictItem[];
}

export type ConflictResultDto = ConflictResult;
export type ConflictItemDto = ConflictItem;

