export type AllocationStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type ResourceStatus = 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE' | 'INACTIVE';

export interface AcademicResourceCandidateDto {
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  categoryId?: number;
  categoryName?: string;
  capacity?: number;
  wastedCapacity: number;
  location?: string;
  building?: string;
  roomNumber?: string;
  status: ResourceStatus;
  eligible: boolean;
  conflictReasons: string[];
}

export interface AcademicAllocationPreviewDto {
  requestId: number;
  requesterName?: string;
  requestPurpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity?: number;
  requestedCapacity: number;
  categoryId?: number;
  categoryName?: string;
  departmentName?: string;
  eligibleResources: AcademicResourceCandidateDto[];
  unavailableResources: AcademicResourceCandidateDto[];
  recommendedResource: AcademicResourceCandidateDto | null;
  canAllocate: boolean;
  conflictResult?: import('./conflict').ConflictResult;
  conflicts?: import('./conflict').ConflictItem[];
}


export interface AcademicAllocationSummaryDto {
  id: number;
  requestId?: number;
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  categoryName?: string;
  location?: string;
  capacity?: number;
  allocatedToUserId?: number;
  allocatedToUserName?: string;
  allocatedToUserEmail?: string;
  departmentId?: number;
  departmentName?: string;
  allocationDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: AllocationStatus;
  allocatedByName?: string;
  createdAt: string;
}

export interface AcademicAllocationDetailDto extends AcademicAllocationSummaryDto {
  academicYearName?: string;
  semesterName?: string;
  timeSlotName?: string;
  building?: string;
  roomNumber?: string;
  roomType?: string;
  requesterRole?: string;
  subjectName?: string;
  sectionName?: string;
  updatedAt?: string;
}

export interface CreateAcademicAllocationRequest {
  requestId: number;
  resourceId: number;
  timeSlotId?: number;
  purpose?: string;
}

export interface AutoAcademicAllocationRequest {
  requestId: number;
  timeSlotId?: number;
  purpose?: string;
}

export interface PreviewAcademicAllocationRequest {
  requestId: number;
  resourceId?: number;
}

export interface AcademicAllocationFilterParams {
  resourceId?: number;
  departmentId?: number;
  status?: AllocationStatus | '';
  date?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
