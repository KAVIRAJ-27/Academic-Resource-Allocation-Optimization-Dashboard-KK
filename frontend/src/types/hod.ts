export interface HodDepartmentInfo {
  id: number;
  name: string;
  code: string;
  status: string;
  institutionName: string;
  hodName: string;
  hodEmail: string;
  hodEmployeeId: string;
  hodSince: string | null;
}

export interface HodDepartmentSummaryKpi {
  totalStudents: number;
  totalFaculty: number;
  totalPrograms: number;
  totalSubjects: number;
  activeSections: number;
  pendingResourceRequests: number;
  activeResourceAllocations: number;
  totalDepartmentResources: number;
}

export interface HodStudentProgramDistribution {
  programId: number;
  programCode: string;
  programName: string;
  degreeType: string;
  studentCount: number;
  percentage: number;
}

export interface HodFacultyWorkloadSummaryItem {
  facultyId: number;
  facultyName: string;
  employeeId: string;
  designation: string;
  totalHours: number;
  teachingHours: number;
  labHours: number;
  assignedSubjectsCount: number;
  workloadStatus: string;
}

export interface HodPendingResourceRequestItem {
  requestId: number;
  resourceName: string;
  resourceCode: string;
  resourceCategoryName: string;
  requesterName: string;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface HodActiveAllocationItem {
  allocationId: number;
  resourceName: string;
  resourceCode: string;
  resourceCategoryName: string;
  allocatedToName: string;
  allocatedToRole: string;
  purpose: string;
  startDatetime: string;
  endDatetime: string;
  quantity: number;
  status: string;
}

export interface HodResourceUtilizationSummary {
  totalResources: number;
  availableCount: number;
  allocatedCount: number;
  maintenanceCount: number;
  inactiveCount: number;
  utilizationRate: number;
}

export interface HodActivityItem {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface HodDashboardResponse {
  department: HodDepartmentInfo;
  summary: HodDepartmentSummaryKpi;
  studentDistribution: HodStudentProgramDistribution[];
  facultyWorkloads: HodFacultyWorkloadSummaryItem[];
  pendingRequests: HodPendingResourceRequestItem[];
  activeAllocations: HodActiveAllocationItem[];
  resourceUtilization: HodResourceUtilizationSummary;
  recentActivities: HodActivityItem[];
}

// ==========================================
// PHASE 21 — HOD FACULTY, STUDENTS & WORKLOAD
// ==========================================

export interface HodFacultySummary {
  id: number;
  userId: number;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  qualification: string;
  specialization: string;
  joiningDate: string | null;
  status: string;
  assignedSubjectsCount: number;
  totalWorkloadHours: number;
  workloadStatus: string;
}

export interface AssignedSubjectItem {
  assignmentId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  programId: number;
  programName: string;
  programCode: string;
  sectionId: number;
  sectionName: string;
  hoursPerWeek: number;
  academicYear: string;
  semesterName: string;
}

export interface FacultyRequestItem {
  requestId: number;
  resourceName: string;
  resourceCode: string;
  purpose: string;
  requestedDate: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface HodFacultyDetail {
  id: number;
  userId: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  qualification: string;
  specialization: string;
  joiningDate: string | null;
  status: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  totalWorkloadHours: number;
  teachingHours: number;
  labHours: number;
  otherHours: number;
  workloadStatus: string;
  workloadCalculatedAt: string | null;
  assignedSubjects: AssignedSubjectItem[];
  recentRequests: FacultyRequestItem[];
}

export interface HodUpdateFacultyRequest {
  phone?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
}

export interface HodUpdateStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  reason?: string;
}

export interface HodStudentSummary {
  id: number;
  userId: number;
  registerNumber: string;
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  programId: number;
  programCode: string;
  programName: string;
  degreeType: string;
  sectionId: number;
  sectionName: string;
  currentSemester: number;
  admissionYear: number;
  status: string;
}

export interface StudentRequestItem {
  requestId: number;
  resourceName: string;
  resourceCode: string;
  purpose: string;
  requestedDate: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface HodStudentDetail {
  id: number;
  userId: number;
  registerNumber: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  programId: number;
  programCode: string;
  programName: string;
  degreeType: string;
  sectionId: number;
  sectionName: string;
  currentSemester: number;
  admissionYear: number;
  status: string;
  recentRequests: StudentRequestItem[];
  hostelInfo?: {
    allocated: boolean;
    hostelBlock?: string;
    roomNumber?: string;
    bedNumber?: string;
  };
}

export interface HodUpdateStudentRequest {
  rollNumber?: string;
  sectionId?: number;
  currentSemester?: number;
}

export interface ProgramOption {
  id: number;
  code: string;
  name: string;
  degreeType: string;
}

export interface SectionOption {
  id: number;
  name: string;
  programId: number;
  programCode: string;
}

export interface HodStudentReferenceData {
  programs: ProgramOption[];
  sections: SectionOption[];
}

export interface HodDepartmentWorkloadOverview {
  totalFaculty: number;
  facultyWithWorkloadCount: number;
  balancedCount: number;
  overloadCount: number;
  underloadCount: number;
  pendingCalculationCount: number;
  averageWeeklyHours: number;
  totalDepartmentHours: number;
  facultyWorkloads: HodFacultySummary[];
}

export interface WorkloadCourseItem {
  assignmentId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  programCode: string;
  programName: string;
  sectionName: string;
  hoursPerWeek: number;
  status: string;
}

export interface WorkloadHistoryItem {
  workloadId: number;
  academicYear: string;
  semesterName: string;
  totalHours: number;
  teachingHours: number;
  labHours: number;
  otherHours: number;
  workloadStatus: string;
  calculatedAt: string;
}

export interface HodFacultyWorkloadDetail {
  facultyId: number;
  facultyName: string;
  employeeId: string;
  designation: string;
  departmentId: number;
  departmentName: string;
  totalHours: number;
  teachingHours: number;
  labHours: number;
  otherHours: number;
  workloadStatus: string;
  calculatedAt: string | null;
  academicYear: string;
  semesterName: string;
  assignments: WorkloadCourseItem[];
  history: WorkloadHistoryItem[];
}

export interface HodDepartmentAssignmentItem {
  assignmentId: number;
  facultyId: number;
  facultyName: string;
  employeeId: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  programId: number;
  programCode: string;
  programName: string;
  sectionId: number;
  sectionName: string;
  hoursPerWeek: number;
  academicYear: string;
  semesterName: string;
  status: string;
}

// ==========================================
// PHASE 22 — HOD RESOURCE REQUESTS & ALLOCATIONS
// ==========================================

export interface HodResourceRequestSummary {
  id: number;
  requesterUserId: number;
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  departmentId: number;
  departmentName: string;
  resourceCategoryId: number;
  categoryName: string;
  requestedResourceId?: number;
  requestedResourceName?: string;
  requestedResourceCode?: string;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface HodApprovalHistoryItem {
  id: number;
  approvedByUserId?: number;
  approvedByName?: string;
  approvalLevel: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  comments?: string;
  createdAt: string;
}

export interface HodRelatedAllocation {
  id: number;
  resourceId?: number;
  resourceName?: string;
  resourceCode?: string;
  startDatetime: string;
  endDatetime: string;
  quantity: number;
  status: string;
}

export interface HodResourceRequestDetail {
  id: number;
  requesterUserId: number;
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  requesterEmployeeOrRegNumber?: string;
  departmentId: number;
  departmentName: string;
  resourceCategoryId: number;
  categoryName: string;
  requestedResourceId?: number;
  requestedResourceName?: string;
  requestedResourceCode?: string;
  resourceLocation?: string;
  resourceCapacity?: number;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  description?: string;
  academicSubject?: string;
  academicSection?: string;
  createdAt: string;
  updatedAt?: string;
  approvalHistory: HodApprovalHistoryItem[];
  relatedAllocation?: HodRelatedAllocation;
}

export interface HodApprovalActionRequest {
  comments?: string;
}

export interface HodResourceRequestOverviewKpi {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  totalRequestsCount: number;
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  maintenanceResources: number;
  inactiveResources: number;
}

export interface HodResourceAllocationSummary {
  id: number;
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  categoryName: string;
  allocatedToUserId: number;
  allocatedToName: string;
  allocatedToEmail: string;
  allocatedToRole: string;
  departmentId: number;
  departmentName: string;
  academicYearName?: string;
  semesterName?: string;
  timeSlotName?: string;
  startDatetime: string;
  endDatetime: string;
  quantity: number;
  purpose: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  allocatedByUserId: number;
  allocatedByName: string;
  requestId?: number;
  createdAt: string;
}

export interface HodResourceAllocationDetail {
  id: number;
  resourceId: number;
  resourceName: string;
  resourceCode: string;
  categoryName: string;
  resourceLocation?: string;
  resourceCapacity?: number;
  allocatedToUserId: number;
  allocatedToName: string;
  allocatedToEmail: string;
  allocatedToRole: string;
  departmentId: number;
  departmentName: string;
  academicYearId?: number;
  academicYearName?: string;
  semesterId?: number;
  semesterName?: string;
  timeSlotId?: number;
  timeSlotName?: string;
  startDatetime: string;
  endDatetime: string;
  quantity: number;
  purpose: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  allocatedByUserId: number;
  allocatedByName: string;
  requestId?: number;
  requestPurpose?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HodResourceAllocationOverviewKpi {
  totalAllocations: number;
  activeAllocations: number;
  pendingAllocations: number;
  completedAllocations: number;
}

