import { ConflictItem } from './conflict';

export interface ScoreBreakdown {
  factor: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  description?: string;
}

export interface OptimizationRecommendation {
  rank: number;
  candidateId: number;
  candidateName: string;
  candidateCode?: string;
  score: number;
  valid: boolean;
  scoreBreakdown: Record<string, number>;
  factors: ScoreBreakdown[];
  reasons: string[];
  conflicts?: ConflictItem[];
  details?: Record<string, any>;
}

export interface OptimizationResult {
  success: boolean;
  requestId?: number;
  totalCandidatesEvaluated: number;
  validCandidates: number;
  message: string;
  recommendations: OptimizationRecommendation[];
}

export interface AcademicOptimizationRequest {
  requestId?: number;
  timeSlotId?: number;
  requestedDate?: string;
  startTime?: string;
  endTime?: string;
  requestedCapacity?: number;
  categoryId?: number;
  departmentId?: number;
}

export interface HostelOptimizationRequest {
  hostelRequestId?: number;
  studentId?: number;
  hostelId?: number;
  startDate?: string;
  endDate?: string;
}
