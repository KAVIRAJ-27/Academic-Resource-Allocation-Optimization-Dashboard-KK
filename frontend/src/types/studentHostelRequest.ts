import { RequestStatus, PriorityLevel } from './studentResourceRequest';

export interface StudentHostelRequest {
  id: number;
  studentId: number;
  studentName: string;
  registerNumber?: string;
  roomNumber?: string;
  hostelId?: number;
  hostelName?: string;
  requestType: string;
  description: string;
  priority: PriorityLevel;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHostelRequestPayload {
  requestType: string;
  description: string;
  priority?: PriorityLevel;
}

export interface StudentHostelRequestSummaryCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  completed: number;
}

export interface HostelRequestFilters {
  status?: RequestStatus | 'ALL';
  requestType?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
