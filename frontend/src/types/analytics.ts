export interface AnalyticsFilterParams {
  preset?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  hostelId?: number;
  blockId?: number;
  floorId?: number;
  roomId?: number;
  categoryId?: number;
  resourceId?: number;
  academicYearId?: number;
  semesterId?: number;
  status?: string;
}

export interface TimeSeriesPoint {
  label: string;
  date: string;
  count: number;
  value: number;
}

export interface RankedResource {
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  categoryName: string;
  resourceType: string;
  departmentName: string;
  capacity: number;
  totalAllocations: number;
  utilizationPercentage: number;
}

export interface AnalyticsOverview {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  maintenanceResources: number;
  overallResourceUtilization: number;
  totalAllocations: number;
  activeAllocations: number;
  totalRequests: number;
  pendingRequests: number;
  requestApprovalRate: number;
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  hostelOccupancyPercentage: number;
  pendingHostelRequests: number;
  openComplaints: number;
  pendingMaintenance: number;
  totalConflictsDetected: number;
  averageFacultyWorkloadHours: number;
}

export interface AcademicUtilizationAnalytics {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  maintenanceResources: number;
  inactiveResources: number;
  utilizationPercentage: number;
  resourcesByCategory: Record<string, number>;
  utilizationByCategory: Record<string, number>;
  topUtilizedResources: RankedResource[];
  lowestUtilizedResources: RankedResource[];
  utilizationTrends: TimeSeriesPoint[];
}

export interface ClassroomAnalytics {
  totalClassrooms: number;
  availableClassrooms: number;
  allocatedClassrooms: number;
  maintenanceClassrooms: number;
  classroomUtilizationPercentage: number;
  averageCapacityUtilization: number;
  highestUtilizedClassrooms: RankedResource[];
  lowestUtilizedClassrooms: RankedResource[];
  classroomUsageTrends: TimeSeriesPoint[];
}

export interface LaboratoryAnalytics {
  totalLaboratories: number;
  availableLaboratories: number;
  allocatedLaboratories: number;
  maintenanceLaboratories: number;
  laboratoryUtilizationPercentage: number;
  mostUtilizedLabs: RankedResource[];
  leastUtilizedLabs: RankedResource[];
  laboratoryUsageTrends: TimeSeriesPoint[];
}

export interface EquipmentAnalytics {
  totalEquipmentTypes: number;
  totalQuantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  maintenanceQuantity: number;
  equipmentUtilizationPercentage: number;
  equipmentList: RankedResource[];
}

export interface AllocationAnalytics {
  totalAllocations: number;
  activeAllocations: number;
  completedAllocations: number;
  cancelledAllocations: number;
  pendingAllocations: number;
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  departmentDistribution: Record<string, number>;
  allocationsOverTime: TimeSeriesPoint[];
}

export interface RequestAnalytics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  completedRequests: number;
  approvalRate: number;
  rejectionRate: number;
  completionRate: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  departmentDistribution: Record<string, number>;
  requestsOverTime: TimeSeriesPoint[];
}

export interface ConflictAnalytics {
  totalConflictsDetected: number;
  criticalConflicts: number;
  highConflicts: number;
  mediumConflicts: number;
  lowConflicts: number;
  conflictsByType: Record<string, number>;
  conflictsByDepartment: Record<string, number>;
  conflictsByResource: Record<string, number>;
}

export interface FacultyWorkloadItem {
  facultyId: number;
  facultyName: string;
  employeeId: string;
  departmentName: string;
  totalHours: number;
  teachingHours: number;
  labHours: number;
  workloadStatus: string;
}

export interface FacultyWorkloadAnalytics {
  totalFaculty: number;
  averageWorkloadHours: number;
  maxWorkloadHours: number;
  minWorkloadHours: number;
  overloadedFacultyCount: number;
  balancedFacultyCount: number;
  underutilizedFacultyCount: number;
  workloadStatusDistribution: Record<string, number>;
  facultyWorkloads: FacultyWorkloadItem[];
}

export interface DepartmentMetrics {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  studentCount: number;
  facultyCount: number;
  subjectCount: number;
  resourceCount: number;
  requestCount: number;
  allocationCount: number;
  resourceUtilizationPercentage: number;
  averageFacultyWorkload: number;
}

export interface DepartmentAnalytics {
  departments: DepartmentMetrics[];
}

export interface HostelOccupancyItem {
  hostelId: number;
  hostelName: string;
  hostelType: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyPercentage: number;
}

export interface BlockOccupancyItem {
  blockId: number;
  blockName: string;
  hostelName: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyPercentage: number;
}

export interface HostelOccupancyAnalytics {
  totalHostels: number;
  totalBlocks: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
  inactiveBeds: number;
  occupancyPercentage: number;
  availabilityPercentage: number;
  hostelOccupancies: HostelOccupancyItem[];
  blockOccupancies: BlockOccupancyItem[];
  occupancyTrends: TimeSeriesPoint[];
}

export interface RoomOccupancyDetail {
  roomId: number;
  roomNumber: string;
  roomType: string;
  hostelName: string;
  blockName: string;
  floorNumber: number;
  capacity: number;
  occupiedBeds: number;
  availableBeds: number;
  utilizationPercentage: number;
  status: string;
}

export interface RoomUtilization {
  totalRooms: number;
  fullyOccupiedRooms: number;
  partiallyOccupiedRooms: number;
  emptyRooms: number;
  maintenanceRooms: number;
  roomList: RoomOccupancyDetail[];
}

export interface HostelRequestAnalytics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  approvalRate: number;
  rejectionRate: number;
  requestsByType: Record<string, number>;
  requestsByHostel: Record<string, number>;
  requestsOverTime: TimeSeriesPoint[];
}

export interface HostelComplaintAnalytics {
  totalComplaints: number;
  openComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  rejectedComplaints: number;
  resolutionRate: number;
  complaintsByStatus: Record<string, number>;
  complaintsByCategory: Record<string, number>;
  complaintsByPriority: Record<string, number>;
  complaintsByHostel: Record<string, number>;
  complaintsOverTime: TimeSeriesPoint[];
}

export interface MaintenanceAnalytics {
  totalMaintenanceRequests: number;
  openMaintenance: number;
  assignedMaintenance: number;
  inProgressMaintenance: number;
  completedMaintenance: number;
  cancelledMaintenance: number;
  completionRate: number;
  pendingMaintenance: number;
  maintenanceByStatus: Record<string, number>;
  maintenanceByPriority: Record<string, number>;
  maintenanceByHostel: Record<string, number>;
  maintenanceByResource: Record<string, number>;
  maintenanceOverTime: TimeSeriesPoint[];
}
