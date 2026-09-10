export interface StudentProfile {
  studentId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;

  // Academic Information (Read-only)
  registerNumber: string;
  rollNumber?: string;
  admissionYear: number;
  currentSemester: number;
  status: string;

  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;

  programId?: number;
  programName?: string;
  programCode?: string;
  degreeLevel?: string;
  durationYears?: number;

  sectionId?: number;
  sectionName?: string;

  academicYearId?: number;
  academicYearName?: string;

  // Account Information (Read-only)
  username: string;
  userStatus: string;
  roles: string[];
  lastLoginAt?: string;

  // Hostel Accommodation (Read-only)
  hostelAllocated: boolean;
  hostelAllocationId?: number;
  hostelName?: string;
  blockName?: string;
  floorNumber?: number;
  roomNumber?: string;
  bedNumber?: string;
  allocationStatus?: string;
  allocationStartDate?: string;
}

export interface StudentProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface StudentDashboardStudent {
  id: number;
  name: string;
  registerNumber: string;
  rollNumber?: string;
  email: string;
  phone?: string;
  status: string;
}

export interface StudentDashboardAcademic {
  departmentName?: string;
  departmentCode?: string;
  programName?: string;
  programCode?: string;
  currentSemester?: number;
  sectionName?: string;
  academicYearName?: string;
}

export interface StudentDashboardHostel {
  allocated: boolean;
  hostelName?: string;
  blockName?: string;
  floorNumber?: number;
  roomNumber?: string;
  bedNumber?: string;
  allocationStatus?: string;
}

export interface StudentDashboardMetrics {
  enrolledCoursesCount: number;
  weeklyClassHours: number;
  hostelAllocated: boolean;
  activeAllocationsCount: number;
  pendingRequestsCount: number;
}

export interface StudentActivityItem {
  id: number;
  action: string;
  description: string;
  timestamp: string;
}

export interface StudentDashboardData {
  student: StudentDashboardStudent;
  academic: StudentDashboardAcademic;
  hostel: StudentDashboardHostel;
  metrics: StudentDashboardMetrics;
  recentActivities: StudentActivityItem[];
}
