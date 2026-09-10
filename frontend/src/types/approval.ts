import { ConflictResultDto } from './conflict';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalLevel = 'HOD' | 'PRINCIPAL' | 'ADMIN' | 'WARDEN';

export interface AllocationTimelineItemDto {
  eventType: string;
  status: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  comment?: string;
  metadata?: Record<string, any>;
}

export interface ApprovalSummaryDto {
  id: number;
  entityType: string;
  entityId: number;
  requestType: 'ACADEMIC_RESOURCE' | 'HOSTEL_RESOURCE';
  requestedById?: number;
  requestedByName?: string;
  requestedByEmail?: string;
  requestedByRole?: string;
  approvedById?: number;
  approvedByName?: string;
  approvalLevel: ApprovalLevel;
  status: ApprovalStatus;
  comments?: string;
  purpose?: string;
  resourceCategory?: string;
  requestedResourceName?: string;
  departmentName?: string;
  hostelName?: string;
  roomNumber?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApprovalDetailDto extends ApprovalSummaryDto {
  description?: string;
  priority?: string;
  startTime?: string;
  endTime?: string;
  quantity?: number;
  facultyName?: string;
  sectionName?: string;
  subjectName?: string;
  semesterName?: string;
  academicYearName?: string;
  studentName?: string;
  studentRollNumber?: string;
  studentGender?: string;
  blockName?: string;
  floorNumber?: string;
  bedNumber?: string;
  startDate?: string;
  endDate?: string;
  candidateId?: number;
  candidateName?: string;
  candidateCode?: string;
  candidateType?: string;
  candidateCapacity?: number;
  candidateLocation?: string;
  recommendationScore?: number;
  liveConflictCheck?: ConflictResultDto;
  canApprove: boolean;
  cannotApproveReason?: string;
  timeline: AllocationTimelineItemDto[];
}

export interface ApprovalFilterParams {
  status?: ApprovalStatus;
  requestType?: string;
  approvalLevel?: ApprovalLevel;
  departmentId?: number;
  hostelId?: number;
  fromDate?: string;
  toDate?: string;
  pendingOnly?: boolean;
}

export interface CreateApprovalRequestDto {
  requestType: 'ACADEMIC_RESOURCE' | 'HOSTEL_RESOURCE';
  requestId: number;
  recommendedResourceId?: number;
  recommendedBedId?: number;
  comments?: string;
}

export interface ApprovalActionRequestDto {
  comments?: string;
  resourceId?: number;
  bedId?: number;
}
