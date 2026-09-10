export const APP_ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',

  // Admin Routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    STUDENTS: '/admin/students',
    STAFF: '/admin/staff',
    FACULTY: '/admin/faculty',
    HODS: '/admin/hods',
    PRINCIPAL: '/admin/principal',
    WARDENS: '/admin/wardens',
    ACADEMIC: '/admin/academic',
    ACADEMIC_INSTITUTION: '/admin/academic/institution',
    ACADEMIC_DEPARTMENTS: '/admin/academic/departments',
    ACADEMIC_YEARS: '/admin/academic/years',
    ACADEMIC_SEMESTERS: '/admin/academic/semesters',
    ACADEMIC_PROGRAMS: '/admin/academic/programs',
    ACADEMIC_SUBJECTS: '/admin/academic/subjects',
    ACADEMIC_SECTIONS: '/admin/academic/sections',
    DEPARTMENTS: '/admin/departments',
    RESOURCES: '/admin/resources',
    RESOURCES_CATEGORIES: '/admin/resources/categories',
    RESOURCES_LIST: '/admin/resources/list',
    RESOURCES_CLASSROOMS: '/admin/resources/classrooms',
    RESOURCES_LABORATORIES: '/admin/resources/laboratories',
    RESOURCES_EQUIPMENT: '/admin/resources/equipment',
    RESOURCES_TIME_SLOTS: '/admin/resources/time-slots',
    HOSTELS: '/admin/hostels',
    ANALYTICS: '/admin/analytics',
    AI_INSIGHTS: '/admin/ai-insights',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  },

  // Principal Routes
  PRINCIPAL: {
    ROOT: '/principal',
    DASHBOARD: '/principal/dashboard',
    MONITORING: '/principal/monitoring',
    APPROVALS: '/principal/approvals',
    APPROVAL_DETAILS: '/principal/approvals/:id',
    RESOURCE_REQUESTS: '/principal/resource-requests',
    DEPARTMENTS: '/principal/departments',
    RESOURCES: '/principal/resources',
    ALLOCATIONS: '/principal/allocations',
    ANALYTICS: '/principal/analytics',
    AI_INSIGHTS: '/principal/ai-insights',
    REPORTS: '/principal/reports',
  },

  // HOD Routes
  HOD: {
    ROOT: '/hod',
    DASHBOARD: '/hod/dashboard',
    FACULTY: '/hod/faculty',
    STUDENTS: '/hod/students',
    COURSES: '/hod/courses',
    RESOURCES: '/hod/resources',
    RESOURCE_REQUESTS: '/hod/resource-requests',
    ALLOCATIONS: '/hod/allocations',
    TIMETABLE: '/hod/timetable',
    WORKLOAD: '/hod/workload',
    ANALYTICS: '/hod/analytics',
    AI_INSIGHTS: '/hod/ai-insights',
  },

  // Faculty Routes
  FACULTY: {
    ROOT: '/faculty',
    DASHBOARD: '/faculty/dashboard',
    PROFILE: '/faculty/profile',
    ACADEMICS: '/faculty/academics',
    COURSES: '/faculty/courses',
    SUBJECTS: '/faculty/subjects',
    SUBJECT_DETAILS: '/faculty/subjects/:id',
    TIMETABLE: '/faculty/timetable',
    WORKLOAD: '/faculty/workload',
    RESOURCES: '/faculty/resources',
    REQUESTS: '/faculty/resource-requests',
    RESOURCE_REQUESTS: '/faculty/resource-requests',
    RESOURCE_REQUESTS_NEW: '/faculty/resource-requests/new',
    RESOURCE_REQUEST_DETAILS: '/faculty/resource-requests/:id',
    AI_INSIGHTS: '/faculty/ai-insights',
  },

  // Student Routes
  STUDENT: {
    ROOT: '/student',
    DASHBOARD: '/student/dashboard',
    ACADEMICS: '/student/academics',
    PROFILE: '/student/profile',
    COURSES: '/student/courses',
    TIMETABLE: '/student/timetable',
    RESOURCES: '/student/resources',
    REQUESTS: '/student/requests',
    HOSTEL: '/student/hostel',
    HOSTEL_REQUESTS: '/student/hostel-requests',
    HOSTEL_REQUESTS_NESTED: '/student/hostel/requests',
    COMPLAINTS: '/student/complaints',
    HOSTEL_COMPLAINTS_NESTED: '/student/hostel/complaints',
  },

  // Warden Routes
  WARDEN: {
    ROOT: '/warden',
    DASHBOARD: '/warden/dashboard',
    HOSTELS: '/warden/hostels',
    BLOCKS: '/warden/blocks',
    ROOMS: '/warden/rooms',
    ROOM_DETAILS: '/warden/rooms/:roomId',
    BEDS: '/warden/beds',
    BED_DETAILS: '/warden/beds/:bedId',
    STUDENTS: '/warden/students',
    ALLOCATIONS: '/warden/allocations',
    ALLOCATIONS_NEW: '/warden/allocations/new',
    ALLOCATION_DETAILS: '/warden/allocations/:allocationId',
    RESOURCES: '/warden/resources',
    COMPLAINTS: '/warden/complaints',
    COMPLAINT_DETAILS: '/warden/complaints/:id',
    MAINTENANCE: '/warden/maintenance',
    MAINTENANCE_NEW: '/warden/maintenance/new',
    MAINTENANCE_DETAILS: '/warden/maintenance/:id',
    ANALYTICS: '/warden/analytics',
    AI_INSIGHTS: '/warden/ai-insights',
    REPORTS: '/warden/reports',
  },

  // Academic Allocation Engine Routes
  ACADEMIC: {
    ALLOCATIONS: '/academic/allocations',
    ALLOCATION_DETAILS: '/academic/allocations/:id',
  },

  // Hostel Resource Allocation Engine Routes
  HOSTEL_ALLOCATION: {
    ROOT: '/hostel',
    ALLOCATIONS: '/hostel/resource-allocations',
    ALLOCATION_DETAILS: '/hostel/resource-allocations/:id',
  },

  // Centralized Approval Workflow & Tracking (Phase 32)
  APPROVALS: {
    ROOT: '/approvals',
    PENDING: '/approvals/pending',
    DETAILS: '/approvals/:id',
  },

  // Utilization Analytics, Charts & Reports (Phase 33)
  ANALYTICS_HUB: {
    ROOT: '/analytics',
    REPORTS: '/reports',
  },

  // AI Insights, Prediction & Recommendation (Phase 34)
  AI_INSIGHTS: {
    ROOT: '/ai-insights',
  },
} as const;
