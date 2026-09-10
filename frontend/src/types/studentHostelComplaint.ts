import { PriorityLevel } from './studentResourceRequest';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export interface StudentHostelComplaint {
  id: number;
  studentId: number;
  studentName: string;
  registerNumber?: string;
  hostelId?: number;
  hostelName?: string;
  roomId?: number;
  roomNumber?: string;
  category: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: ComplaintStatus;
  assignedToName?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHostelComplaintPayload {
  category: string;
  title: string;
  description: string;
  priority?: PriorityLevel;
}

export interface StudentHostelComplaintSummaryCounts {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  rejected: number;
}

export interface HostelComplaintFilters {
  status?: ComplaintStatus | 'ALL';
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
