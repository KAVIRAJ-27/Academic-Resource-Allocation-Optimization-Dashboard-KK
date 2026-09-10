export interface StudentAcademicOverview {
  studentId: number;
  studentName: string;
  registerNumber: string;
  rollNumber?: string;
  admissionYear: number;
  currentSemester: number;
  status: string;

  institutionId?: number;
  institutionName?: string;
  institutionCode?: string;

  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;

  programId?: number;
  programName?: string;
  programCode?: string;
  degreeLevel?: string;
  durationYears?: number;
  totalSemesters?: number;

  sectionId?: number;
  sectionName?: string;
  sectionCapacity?: number;

  academicYearId?: number;
  academicYearName?: string;

  semesterId?: number;
  semesterName?: string;
  semesterNumber?: number;
}

export interface StudentSubject {
  id: number;
  code: string;
  name: string;
  credits: number;
  subjectType: 'THEORY' | 'PRACTICAL' | 'PROJECT' | 'ELECTIVE';
  status: string;

  semesterId?: number;
  semesterName?: string;
  semesterNumber?: number;

  programId?: number;
  programName?: string;

  facultyId?: number;
  facultyName?: string;
  facultyEmployeeId?: string;
  facultyDesignation?: string;
  facultyEmail?: string;
  facultyDepartment?: string;
  hoursPerWeek?: number;
}

export interface StudentSubjectDetails {
  id: number;
  code: string;
  name: string;
  credits: number;
  subjectType: 'THEORY' | 'PRACTICAL' | 'PROJECT' | 'ELECTIVE';
  status: string;

  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;

  programId?: number;
  programName?: string;
  programCode?: string;

  semesterId?: number;
  semesterName?: string;
  semesterNumber?: number;

  facultyId?: number;
  facultyName?: string;
  facultyEmployeeId?: string;
  facultyDesignation?: string;
  facultyQualification?: string;
  facultyEmail?: string;
  facultyDepartment?: string;
  hoursPerWeek?: number;

  sectionId?: number;
  sectionName?: string;
}

export interface StudentTimetableEntry {
  id: number;
  dayOfWeek: string;
  startTime: string; // "09:00:00"
  endTime: string;   // "10:00:00"
  timeSlotName: string;

  subjectId: number;
  subjectCode: string;
  subjectName: string;
  subjectType: string;

  facultyId?: number;
  facultyName?: string;
  facultyDesignation?: string;

  resourceId?: number;
  resourceName?: string;
  resourceCode?: string;
  resourceCategory?: string;

  status: string;
}

export interface StudentAcademicResponse {
  overview: StudentAcademicOverview;
  subjects: StudentSubject[];
  timetable: StudentTimetableEntry[];
  availableSemesters: number[];
  totalCredits: number;
}

export interface StudentSubjectQueryParams {
  search?: string;
  semester?: number;
  type?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
