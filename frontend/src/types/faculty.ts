export interface FacultyProfile {
  userId: number;
  facultyId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  qualification?: string;
  employeeId: string;
  designation: string;
  joiningDate?: string;
  facultyStatus: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  institutionName?: string;
  username: string;
  accountStatus: string;
  roles: string[];
  lastLoginAt?: string;
}

export interface UpdateFacultyProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
  qualification?: string;
}

export interface FacultySummary {
  facultyId: number;
  userId: number;
  fullName: string;
  employeeId: string;
  designation: string;
  qualification?: string;
  email: string;
  phone?: string;
  departmentName?: string;
  departmentCode?: string;
  status: string;
  joiningDate?: string;
}

export interface FacultyDepartmentSummary {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  institutionName?: string;
}

export interface FacultyKpiMetrics {
  assignedSubjectsCount: number;
  weeklyInstructionHours: number;
  upcomingClassesCount: number;
  pendingRequisitionsCount: number;
}

export interface FacultyAssignedSubject {
  id: number;
  subjectId?: number;
  subjectCode: string;
  subjectName: string;
  programName?: string;
  sectionName?: string;
  academicYearName?: string;
  semesterName?: string;
  hoursPerWeek: number;
  status: string;
}

export interface FacultyWorkloadData {
  id: number;
  totalHours: number;
  teachingHours: number;
  labHours: number;
  otherHours: number;
  workloadStatus: string;
  academicYearName?: string;
  semesterName?: string;
  calculatedAt: string;
}

export interface FacultyTimetableClass {
  id: number;
  subjectCode: string;
  subjectName: string;
  roomNumber?: string;
  roomName?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  sectionName?: string;
}

export interface FacultyRequisitionItem {
  id: number;
  resourceName: string;
  categoryName?: string;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  priority: string;
  status: string;
}

export interface FacultyRequisitionSummary {
  pendingCount: number;
  approvedCount: number;
  totalCount: number;
  recentRequisitions: FacultyRequisitionItem[];
}

export interface FacultyActivity {
  id: number;
  action: string;
  description: string;
  createdAt: string;
}

export interface FacultyDashboardData {
  profile: FacultySummary;
  department?: FacultyDepartmentSummary;
  metrics: FacultyKpiMetrics;
  assignedSubjects: FacultyAssignedSubject[];
  workloadSummary?: FacultyWorkloadData | null;
  timetableSummary: FacultyTimetableClass[];
  requisitionSummary?: FacultyRequisitionSummary;
  recentActivities: FacultyActivity[];
}

export interface FacultyCourse {
  programId: number;
  programCode: string;
  programName: string;
  degreeType: string;
  durationYears: number;
  departmentName?: string;
  departmentCode?: string;
  status: string;
  assignedSubjectsCount: number;
}

export interface FacultySubject {
  assignmentId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  subjectType: string;
  programId?: number;
  programCode?: string;
  programName?: string;
  semesterId?: number;
  semesterNumber?: number;
  semesterName?: string;
  academicYearId?: number;
  academicYearName?: string;
  sectionId?: number;
  sectionName?: string;
  hoursPerWeek?: number;
  status: string;
}

export interface FacultySubjectSection {
  assignmentId: number;
  sectionId: number;
  sectionName: string;
  capacity?: number;
  hoursPerWeek?: number;
  status: string;
}

export interface FacultyTimetableEntry {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timeSlotName?: string;
  subjectId?: number;
  subjectCode: string;
  subjectName: string;
  subjectType?: string;
  programId?: number;
  programCode?: string;
  programName?: string;
  sectionId?: number;
  sectionName?: string;
  academicYearName?: string;
  semesterNumber?: number;
  semesterName?: string;
  resourceId?: number;
  resourceName?: string;
  resourceCode?: string;
  resourceCategory?: string;
  resourceLocation?: string;
  resourceCapacity?: number;
  status: string;
}

export interface FacultySubjectDetails {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  subjectType: string;
  status: string;
  programId?: number;
  programCode?: string;
  programName?: string;
  degreeType?: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  semesterId?: number;
  semesterNumber?: number;
  semesterName?: string;
  academicYearName?: string;
  totalHoursPerWeek: number;
  assignedSections: FacultySubjectSection[];
  timetableSlots: FacultyTimetableEntry[];
}

export interface FacultyAcademicOverview {
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  institutionName?: string;
  assignedCoursesCount: number;
  assignedSubjectsCount: number;
  assignedSectionsCount: number;
  totalWeeklyInstructionHours: number;
  assignedPrograms: FacultyCourse[];
  assignedSubjects: FacultySubject[];
}

export interface FacultyTimetableResponse {
  totalEntriesCount: number;
  todayEntriesCount: number;
  todayDayOfWeek: string;
  todayDate: string;
  todayEntries: FacultyTimetableEntry[];
  entries: FacultyTimetableEntry[];
}

export interface FacultySubjectFilterParams {
  search?: string;
  programId?: number;
  semester?: number;
  page?: number;
  size?: number;
}

export interface FacultyTimetableFilterParams {
  dayOfWeek?: string;
  subjectId?: number;
  sectionId?: number;
  todayOnly?: boolean;
}

// ==========================================
// PHASE 19: FACULTY WORKLOAD & RESOURCE REQUESTS
// ==========================================

export interface FacultyWorkloadSummary {
  totalHours: number;
  teachingHours: number;
  labHours: number;
  otherHours: number;
  workloadStatus: string;
  subjectCount: number;
  sectionCount: number;
  maxWeeklyHoursLimit: number;
  utilizationPercentage: number;
  academicYear?: string;
  semester?: string;
}

export interface FacultyWorkloadBreakdownItem {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  courseName?: string;
  sectionName?: string;
  hours: number;
  credits: number;
  academicPeriod?: string;
}

export interface FacultyWorkloadHistoryItem {
  academicYear: string;
  semester: string;
  totalHours: number;
  teachingHours: number;
  labHours: number;
  workloadStatus: string;
  calculatedAt?: string;
}

export interface FacultyWorkloadResponse {
  summary: FacultyWorkloadSummary;
  breakdown: FacultyWorkloadBreakdownItem[];
  history: FacultyWorkloadHistoryItem[];
}

export interface FacultyResourceRequestItem {
  id: number;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity: number;
  priority: string;
  status: string;
  description?: string;
  resourceId?: number;
  resourceName?: string;
  resourceCode?: string;
  resourceCategoryName?: string;
  resourceLocation?: string;
  departmentName?: string;
  subjectCode?: string;
  subjectName?: string;
  sectionName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FacultyResourceRequestDetails {
  id: number;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity: number;
  priority: string;
  status: string;
  description?: string;
  resourceId?: number;
  resourceName?: string;
  resourceCode?: string;
  resourceCategoryName?: string;
  resourceLocation?: string;
  resourceCapacity?: number;
  departmentName?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterEmployeeId?: string;
  subjectCode?: string;
  subjectName?: string;
  sectionName?: string;
  cancellable: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FacultyResourceRequestSummaryCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  completed: number;
}

export interface FacultyAvailableResource {
  id: number;
  name: string;
  code: string;
  categoryId?: number;
  categoryName?: string;
  capacity?: number;
  location?: string;
  status?: string;
}

export interface CreateFacultyResourceRequestPayload {
  resourceId: number;
  purpose: string;
  requestedDate: string;
  startTime: string;
  endTime: string;
  quantity?: number;
  priority?: string;
  description?: string;
  subjectId?: number;
  sectionId?: number;
}

export interface FacultyResourceRequestFilterParams {
  status?: string;
  categoryId?: number;
  date?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

