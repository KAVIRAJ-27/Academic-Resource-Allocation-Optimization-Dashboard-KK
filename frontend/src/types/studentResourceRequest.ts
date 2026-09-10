export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface StudentResourceRequest {
  id: number;
  requesterUserId: number;
  requesterName: string;

  resourceId?: number;
  resourceName?: string;
  resourceCode?: string;
  resourceLocation?: string;
  resourceCapacity?: number;

  categoryId?: number;
  categoryName?: string;

  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;

  requestedDate: string; // YYYY-MM-DD
  startTime: string;     // HH:mm:ss or HH:mm
  endTime: string;       // HH:mm:ss or HH:mm
  purpose: string;
  quantity?: number;
  priority: PriorityLevel;
  status: RequestStatus;
  description?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface CreateResourceRequestPayload {
  resourceId: number;
  requestedDate: string; // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  purpose: string;
  priority?: PriorityLevel;
  quantity?: number;
  description?: string;
}

export interface StudentResourceSummary {
  id: number;
  code: string;
  name: string;
  categoryId?: number;
  categoryName?: string;
  departmentId?: number;
  departmentName?: string;
  capacity?: number;
  location?: string;
  status: string;
}

export interface StudentResourceRequestSummaryCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  completed: number;
}

export interface ResourceRequestFilters {
  status?: RequestStatus | 'ALL';
  categoryId?: number;
  date?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
