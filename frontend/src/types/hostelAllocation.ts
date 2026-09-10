export type AllocationStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface HostelCandidateDto {
  bedId: number;
  bedNumber: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  currentOccupancy: number;
  capacity: number;
  availableCapacity: number;
  floorId: number;
  floorNumber: number;
  blockId: number;
  blockName: string;
  hostelId: number;
  hostelName: string;
  hostelCode: string;
  available: boolean;
  unavailabilityReason?: string;
}

export interface HostelAllocationConflictDto {
  conflictType: string;
  entityType?: string;
  entityId?: number;
  message: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR';
  details?: string;
}

export interface HostelAllocationPreviewDto {
  eligible: boolean;
  reason: string;
  recommendedBed?: HostelCandidateDto;
  candidateCount: number;
  eligibleCandidates: HostelCandidateDto[];
  unavailableCandidates: HostelCandidateDto[];
  conflicts: HostelAllocationConflictDto[];
  conflictResult?: import('./conflict').ConflictResult;
}


export interface HostelAllocationResponseDto {
  id: number;
  studentId: number;
  rollNumber: string;
  studentName: string;
  email: string;
  departmentName: string;
  bedId: number;
  bedNumber: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  floorId: number;
  floorNumber: number;
  blockId: number;
  blockName: string;
  hostelId: number;
  hostelName: string;
  hostelCode: string;
  startDate: string;
  endDate?: string;
  status: AllocationStatus;
  allocatedAt: string;
  releasedAt?: string;
  allocationMethod: 'MANUAL' | 'AUTO';
  hostelRequestId?: number;
}

export interface HostelAllocationRequestDto {
  studentId: number;
  hostelId: number;
  roomId: number;
  bedId: number;
  hostelRequestId?: number;
  startDate: string;
  endDate?: string;
  academicYearId?: number;
}

export interface AutoHostelAllocationRequestDto {
  hostelRequestId: number;
  hostelId?: number;
  academicYearId?: number;
  startDate?: string;
  endDate?: string;
}

export interface HostelAllocationPreviewRequestDto {
  hostelRequestId?: number;
  studentId?: number;
  hostelId?: number;
}

export interface HostelAllocationFilterParams {
  hostelId?: number;
  blockId?: number;
  roomId?: number;
  studentId?: number;
  status?: AllocationStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
