export interface PrincipalInstitutionDto {
  id: number;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  address?: string;
  principalName: string;
  principalEmail: string;
  departmentCount: number;
  programCount: number;
  studentCount: number;
  facultyCount: number;
}

export interface PrincipalKpiSummaryDto {
  totalDepartments: number;
  totalStudents: number;
  totalFaculty: number;
  totalPrograms: number;
  totalSubjects: number;
  totalSections: number;
  academicResources: number;
  pendingResourceRequests: number;
  activeAllocations: number;
  totalHostels: number;
  totalHostelBeds: number;
  occupiedHostelBeds: number;
  pendingApprovals: number;
}

export interface PrincipalDepartmentOverviewDto {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  status: string;
  studentCount: number;
  facultyCount: number;
  programCount: number;
  subjectCount: number;
  pendingRequestCount: number;
  activeAllocationCount: number;
}

export interface DepartmentStudentCountDto {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  studentCount: number;
}

export interface ProgramStudentCountDto {
  programId: number;
  programName: string;
  programCode: string;
  studentCount: number;
}

export interface PrincipalStudentOverviewDto {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  byDepartment: DepartmentStudentCountDto[];
  byProgram: ProgramStudentCountDto[];
}

export interface DepartmentFacultyCountDto {
  departmentId: number;
  departmentName: string;
  departmentCode?: string;
  facultyCount: number;
}

export interface WorkloadSummaryDto {
  totalRecorded: number;
  balancedCount: number;
  overloadCount: number;
  underloadCount: number;
  averageHours: number | null;
}

export interface PrincipalFacultyOverviewDto {
  totalFaculty: number;
  activeFaculty: number;
  inactiveFaculty: number;
  byDepartment: DepartmentFacultyCountDto[];
  workloadSummary: WorkloadSummaryDto;
}

export interface PrincipalResourceOverviewDto {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  maintenanceResources: number;
  inactiveResources: number;
}

export interface PrincipalRequestOverviewDto {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  completedRequests: number;
}

export interface PrincipalAllocationOverviewDto {
  totalAllocations: number;
  activeAllocations: number;
  pendingAllocations: number;
  completedAllocations: number;
  cancelledAllocations: number;
}

export interface PrincipalHostelOverviewDto {
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
  inactiveBeds: number;
  occupancyRate: number | null;
  occupancyFormula?: string;
}

export interface PendingApprovalItemDto {
  id: number;
  entityType: string;
  entityId: number;
  requesterName: string;
  requesterEmail: string;
  approvalLevel: string;
  status: string;
  comments?: string;
  createdAt: string;
}

export interface PrincipalPendingApprovalsDto {
  pendingCount: number;
  items: PendingApprovalItemDto[];
}

export interface PrincipalRecentActivityDto {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  userName: string;
  userEmail?: string;
  createdAt: string;
  details: string;
}

export interface PrincipalDashboardResponse {
  institution: PrincipalInstitutionDto;
  kpiSummary: PrincipalKpiSummaryDto;
  departments: PrincipalDepartmentOverviewDto[];
  students: PrincipalStudentOverviewDto;
  faculty: PrincipalFacultyOverviewDto;
  academicResources: PrincipalResourceOverviewDto;
  resourceRequests: PrincipalRequestOverviewDto;
  allocations: PrincipalAllocationOverviewDto;
  hostel: PrincipalHostelOverviewDto;
  approvals: PrincipalPendingApprovalsDto;
  recentActivity: PrincipalRecentActivityDto[];
}

// ==================== PHASE 24 MONITORING & APPROVALS ====================

export interface PrincipalMonitoringSummaryDto {
  totalDepartments: number;
  totalStudents: number;
  totalFaculty: number;
  availableResources: number;
  maintenanceResources: number;
  pendingRequests: number;
  activeAllocations: number;
  pendingApprovals: number;
}

export interface PrincipalDepartmentMonitoringDto {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  hodName: string;
  status: string;
  studentCount: number;
  facultyCount: number;
  programCount: number;
  subjectCount: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeAllocations: number;
}

export interface PrincipalHostelMonitoringDto {
  hostelId: number;
  hostelName: string;
  hostelCode: string;
  gender: string;
  status: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
  occupancyRate: number | null;
}

export interface PrincipalMonitoringResponse {
  summary: PrincipalMonitoringSummaryDto;
  departments: PrincipalDepartmentMonitoringDto[];
  hostels: PrincipalHostelMonitoringDto[];
  recentActivity: PrincipalRecentActivityDto[];
}

export interface PrincipalApprovalHistoryItemDto {
  id: number;
  approvalLevel: string;
  status: string;
  reviewerName: string;
  reviewerEmail: string;
  approvedByName?: string;
  comments: string;
  createdAt: string;
}

export interface PrincipalRelatedAllocationDto {
  id: number;
  resourceName: string;
  resourceCode: string;
  allocatedToName: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
}

export interface PrincipalResourceRequestSummaryDto {
  id: number;
  requesterUserId: number;
  requesterName: string;
  requesterEmail: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  categoryId: number;
  categoryName: string;
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity: number;
  priority: string;
  status: string;
  createdAt: string;
}

export interface PrincipalResourceRequestDetailDto {
  id: number;
  requesterUserId: number;
  requesterName: string;
  requesterEmail: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  categoryId: number;
  categoryName: string;
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  resourceCapacity: number;
  resourceLocation: string;
  purpose: string;
  description: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity: number;
  priority: string;
  status: string;
  createdAt: string;
  approvalHistory: PrincipalApprovalHistoryItemDto[];
  relatedAllocation?: PrincipalRelatedAllocationDto;
  canPrincipalApprove: boolean;
  canPrincipalReject: boolean;
}

export interface PrincipalApprovalSummaryDto {
  id: number;
  requestId: number;
  entityType: string;
  requesterName: string;
  requesterEmail: string;
  departmentName: string;
  departmentCode: string;
  approvalLevel: string;
  status: string;
  approverName: string;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrincipalApprovalDetailDto {
  id: number;
  requestId: number;
  entityType: string;
  requesterName: string;
  requesterEmail: string;
  departmentName: string;
  departmentCode: string;
  resourceName: string;
  resourceCode: string;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  priority: string;
  approvalLevel: string;
  status: string;
  approverName: string;
  comments: string;
  createdAt: string;
  updatedAt: string;
  canApprove: boolean;
  canReject: boolean;
  approvalHistory: PrincipalApprovalHistoryItemDto[];
}

export interface PrincipalApprovalActionRequest {
  comments?: string;
}

export interface PrincipalAllocationSummaryDto {
  id: number;
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  departmentName: string;
  departmentCode: string;
  allocatedToName: string;
  allocatedToEmail: string;
  purpose: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  createdAt: string;
}

export interface PrincipalAllocationDetailDto {
  id: number;
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  resourceCategory: string;
  resourceCapacity: number;
  resourceLocation: string;
  departmentName: string;
  departmentCode: string;
  allocatedToName: string;
  allocatedToEmail: string;
  academicYearName: string;
  semesterName: string;
  allocatedByName: string;
  requestId: number;
  quantity: number;
  purpose: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  createdAt: string;
}

export interface PrincipalResourceRequestFilterParams {
  departmentId?: number;
  categoryId?: number;
  resourceId?: number;
  status?: string;
  priority?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PrincipalApprovalFilterParams {
  departmentId?: number;
  status?: string;
  approvalLevel?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PrincipalAllocationFilterParams {
  departmentId?: number;
  resourceId?: number;
  facultyId?: number;
  subjectId?: number;
  sectionId?: number;
  status?: string;
  date?: string;
  page?: number;
  size?: number;
  sort?: string;
}

