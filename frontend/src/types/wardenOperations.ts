export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MaintenanceStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// ------------------------------------
// HOSTEL FACILITIES / RESOURCES
// ------------------------------------
export interface WardenFacilitySummary {
  id: number;
  hostelId: number;
  hostelName: string;
  hostelCode: string;
  name: string;
  description?: string;
  quantity: number;
  status: string;
}

export interface WardenFacilityDetail extends WardenFacilitySummary {
  hostelAddress?: string;
  hostelCapacity?: number;
}

export interface UpdateFacilityRequest {
  status?: string;
  description?: string;
  quantity?: number;
}

export interface WardenFacilityFilterParams {
  hostelId?: number;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ------------------------------------
// HOSTEL COMPLAINTS
// ------------------------------------
export interface WardenComplaintSummary {
  id: number;
  studentId: number;
  studentName: string;
  registerNumber: string;
  hostelId: number;
  hostelName: string;
  hostelCode: string;
  roomId?: number;
  roomNumber?: string;
  blockName?: string;
  floorNumber?: number;
  category: string;
  title: string;
  priority: PriorityLevel;
  status: ComplaintStatus;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface WardenComplaintDetail extends WardenComplaintSummary {
  description: string;
  studentEmail?: string;
  studentPhone?: string;
  departmentName?: string;
  programName?: string;
  currentSemester?: number;
  assignedToEmail?: string;
}

export interface UpdateComplaintStatusRequest {
  status: ComplaintStatus;
  remarks?: string;
}

export interface WardenComplaintFilterParams {
  hostelId?: number;
  blockId?: number;
  floorNumber?: number;
  roomId?: number;
  status?: ComplaintStatus;
  priority?: PriorityLevel;
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ------------------------------------
// MAINTENANCE WORK ORDERS
// ------------------------------------
export interface WardenMaintenanceSummary {
  id: number;
  hostelId: number;
  hostelName: string;
  hostelCode: string;
  roomId?: number;
  roomNumber?: string;
  blockName?: string;
  floorNumber?: number;
  resourceId?: number;
  resourceName?: string;
  reportedById: number;
  reportedByName: string;
  assignedToId?: number;
  assignedToName?: string;
  title: string;
  priority: PriorityLevel;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WardenMaintenanceDetail extends WardenMaintenanceSummary {
  description: string;
  reportedByEmail?: string;
  assignedToEmail?: string;
}

export interface UpdateMaintenanceStatusRequest {
  status: MaintenanceStatus;
  remarks?: string;
}

export interface AssignMaintenanceRequest {
  assignedToId: number;
}

export interface CreateWardenMaintenanceRequest {
  hostelId: number;
  roomId?: number;
  resourceId?: number;
  title: string;
  description: string;
  priority?: PriorityLevel;
}

export interface WardenMaintenanceFilterParams {
  hostelId?: number;
  blockId?: number;
  floorNumber?: number;
  roomId?: number;
  status?: MaintenanceStatus;
  priority?: PriorityLevel;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ------------------------------------
// WARDEN OVERVIEW TELEMETRY
// ------------------------------------
export interface WardenOverview {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  residentStudents: number;
  totalFacilities: number;
  activeFacilities: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  openMaintenance: number;
  inProgressMaintenance: number;
  completedMaintenance: number;
}
