import { ROLES, UserRole } from './roles';
import { APP_ROUTES } from './routes';
import { NavItem } from '../types/navigation';

export const ROLE_NAVIGATION: Record<UserRole, { title: string; subtitle: string; items: NavItem[] }> = {
  [ROLES.ADMIN]: {
    title: 'Admin Console',
    subtitle: 'System-Wide Governance',
    items: [
      { title: 'Dashboard', href: APP_ROUTES.ADMIN.DASHBOARD, iconName: 'LayoutDashboard', category: 'General' },
      { title: 'User Directory', href: APP_ROUTES.ADMIN.USERS, iconName: 'Users', category: 'General' },
      { title: 'Students', href: APP_ROUTES.ADMIN.STUDENTS, iconName: 'GraduationCap', category: 'Academic' },
      { title: 'Staff Directory', href: APP_ROUTES.ADMIN.STAFF, iconName: 'Briefcase', category: 'Academic' },
      { title: 'Faculty', href: APP_ROUTES.ADMIN.FACULTY, iconName: 'UserCheck', category: 'Academic' },
      { title: 'HODs', href: APP_ROUTES.ADMIN.HODS, iconName: 'Briefcase', category: 'Academic' },
      { title: 'Principal Office', href: APP_ROUTES.ADMIN.PRINCIPAL, iconName: 'ShieldCheck', category: 'Academic' },
      { title: 'Wardens', href: APP_ROUTES.ADMIN.WARDENS, iconName: 'KeyRound', category: 'Hostel' },
      { title: 'Academic Structure', href: APP_ROUTES.ADMIN.ACADEMIC, iconName: 'Layers', category: 'Academic' },
      { title: 'Departments', href: APP_ROUTES.ADMIN.DEPARTMENTS, iconName: 'Building2', category: 'Academic' },
      { title: 'Academic Resources', href: APP_ROUTES.ADMIN.RESOURCES, iconName: 'Layers', category: 'Academic' },
      { title: 'Hostels & Facilities', href: APP_ROUTES.ADMIN.HOSTELS, iconName: 'Hotel', category: 'Hostel' },
      { title: 'Hostel Allocations Engine', href: APP_ROUTES.HOSTEL_ALLOCATION.ALLOCATIONS, iconName: 'BedDouble', category: 'Hostel' },
      { title: 'Approval Center', href: APP_ROUTES.APPROVALS.ROOT, iconName: 'CheckSquare', category: 'General' },
      { title: 'Analytics Engine', href: APP_ROUTES.ADMIN.ANALYTICS, iconName: 'BarChart3', category: 'General' },
      { title: 'AI Insights & Forecasts', href: APP_ROUTES.AI_INSIGHTS.ROOT, iconName: 'BrainCircuit', category: 'General' },
      { title: 'Audit Reports', href: APP_ROUTES.ADMIN.REPORTS, iconName: 'FileText', category: 'General' },
      { title: 'System Settings', href: APP_ROUTES.ADMIN.SETTINGS, iconName: 'Settings', category: 'General' },
    ],
  },

  [ROLES.PRINCIPAL]: {
    title: 'Principal Portal',
    subtitle: 'Institutional Oversight',
    items: [
      { title: 'Executive Dashboard', href: APP_ROUTES.PRINCIPAL.DASHBOARD, iconName: 'LayoutDashboard', category: 'General' },
      { title: 'Live Monitoring', href: APP_ROUTES.PRINCIPAL.MONITORING, iconName: 'Activity', category: 'Academic' },
      { title: 'Pending Approvals', href: APP_ROUTES.PRINCIPAL.APPROVALS, iconName: 'CheckSquare', category: 'Academic' },
      { title: 'Resource Requests', href: APP_ROUTES.PRINCIPAL.RESOURCE_REQUESTS, iconName: 'FileText', category: 'Academic' },
      { title: 'Resource Allocations', href: APP_ROUTES.PRINCIPAL.ALLOCATIONS, iconName: 'CalendarRange', category: 'Academic' },
      { title: 'Institutional Analytics', href: APP_ROUTES.PRINCIPAL.ANALYTICS, iconName: 'TrendingUp', category: 'General' },
      { title: 'AI Insights & Forecasts', href: APP_ROUTES.AI_INSIGHTS.ROOT, iconName: 'BrainCircuit', category: 'General' },
      { title: 'Executive Reports', href: APP_ROUTES.PRINCIPAL.REPORTS, iconName: 'FileText', category: 'General' },
    ],
  },

  [ROLES.HOD]: {
    title: 'HOD Workspace',
    subtitle: 'Department Operations',
    items: [
      { title: 'Department Dashboard', href: APP_ROUTES.HOD.DASHBOARD, iconName: 'LayoutDashboard', category: 'General' },
      { title: 'Department Faculty', href: APP_ROUTES.HOD.FACULTY, iconName: 'Users', category: 'Academic' },
      { title: 'Faculty Workload', href: APP_ROUTES.HOD.WORKLOAD, iconName: 'Activity', category: 'Academic' },
      { title: 'Enrolled Students', href: APP_ROUTES.HOD.STUDENTS, iconName: 'GraduationCap', category: 'Academic' },
      { title: 'Department Courses', href: APP_ROUTES.HOD.COURSES, iconName: 'BookOpen', category: 'Academic' },
      { title: 'Labs & Classrooms', href: APP_ROUTES.HOD.RESOURCES, iconName: 'Layers', category: 'Academic' },
      { title: 'Resource Requests', href: APP_ROUTES.HOD.RESOURCE_REQUESTS, iconName: 'FileText', category: 'Academic' },
      { title: 'Resource Allocations', href: APP_ROUTES.HOD.ALLOCATIONS, iconName: 'CalendarRange', category: 'Academic' },
      { title: 'Approval Center', href: APP_ROUTES.APPROVALS.ROOT, iconName: 'CheckSquare', category: 'General' },
      { title: 'Master Timetable', href: APP_ROUTES.HOD.TIMETABLE, iconName: 'Clock', category: 'Academic' },
      { title: 'Department Analytics', href: APP_ROUTES.HOD.ANALYTICS, iconName: 'BarChart2', category: 'General' },
      { title: 'AI Insights & Forecasts', href: APP_ROUTES.AI_INSIGHTS.ROOT, iconName: 'BrainCircuit', category: 'General' },
    ],
  },

  [ROLES.FACULTY]: {
    title: 'Faculty Desk',
    subtitle: 'Instruction & Resources',
    items: [
      { title: 'Faculty Dashboard', href: APP_ROUTES.FACULTY.DASHBOARD, iconName: 'LayoutDashboard', category: 'General' },
      { title: 'Academic Profile', href: APP_ROUTES.FACULTY.PROFILE, iconName: 'User', category: 'General' },
      { title: 'Academics Overview', href: APP_ROUTES.FACULTY.ACADEMICS, iconName: 'Layers', category: 'Academic' },
      { title: 'Assigned Subjects', href: APP_ROUTES.FACULTY.SUBJECTS, iconName: 'BookOpen', category: 'Academic' },
      { title: 'Class Timetable', href: APP_ROUTES.FACULTY.TIMETABLE, iconName: 'Clock', category: 'Academic' },
      { title: 'Workload Metrics', href: APP_ROUTES.FACULTY.WORKLOAD, iconName: 'Activity', category: 'Academic' },
      { title: 'Resource Requests', href: APP_ROUTES.FACULTY.REQUESTS, iconName: 'Send', category: 'Academic' },
      { title: 'AI Workload Insights', href: APP_ROUTES.AI_INSIGHTS.ROOT, iconName: 'BrainCircuit', category: 'General' },
    ],
  },

  [ROLES.STUDENT]: {
    title: 'Student Portal',
    subtitle: 'Academics & Hostel Life',
    items: [
      { title: 'Dashboard', href: APP_ROUTES.STUDENT.DASHBOARD, iconName: 'LayoutDashboard', category: 'General' },
      { title: 'Academics', href: APP_ROUTES.STUDENT.ACADEMICS, iconName: 'BookOpen', category: 'Academic' },
      { title: 'Resources', href: APP_ROUTES.STUDENT.RESOURCES, iconName: 'Layers', category: 'Academic' },
      { title: 'Hostel', href: APP_ROUTES.STUDENT.HOSTEL, iconName: 'Hotel', category: 'Hostel' },
      { title: 'Requests', href: APP_ROUTES.STUDENT.REQUESTS, iconName: 'Send', category: 'Academic' },
      { title: 'Profile', href: APP_ROUTES.STUDENT.PROFILE, iconName: 'User', category: 'General' },
    ],
  },

  [ROLES.WARDEN]: {
    title: 'Warden Console',
    subtitle: 'Residential & Facilities',
    items: [
      { title: 'Hostel Dashboard', href: APP_ROUTES.WARDEN.DASHBOARD, iconName: 'LayoutDashboard', category: 'General' },
      { title: 'Hostel Buildings', href: APP_ROUTES.WARDEN.HOSTELS, iconName: 'Building', category: 'Hostel' },
      { title: 'Hostel Blocks', href: APP_ROUTES.WARDEN.BLOCKS, iconName: 'Layers', category: 'Hostel' },
      { title: 'Room Inventory', href: APP_ROUTES.WARDEN.ROOMS, iconName: 'Grid', category: 'Hostel' },
      { title: 'Bed Occupancy', href: APP_ROUTES.WARDEN.BEDS, iconName: 'BedDouble', category: 'Hostel' },
      { title: 'Resident Students', href: APP_ROUTES.WARDEN.STUDENTS, iconName: 'Users', category: 'Hostel' },
      { title: 'Bed Allocations', href: APP_ROUTES.WARDEN.ALLOCATIONS, iconName: 'CheckSquare', category: 'Hostel' },
      { title: 'Approval Center', href: APP_ROUTES.APPROVALS.ROOT, iconName: 'CheckSquare', category: 'General' },
      { title: 'Hostel Assets & Wi-Fi', href: APP_ROUTES.WARDEN.RESOURCES, iconName: 'Wifi', category: 'Hostel' },
      { title: 'Student Complaints', href: APP_ROUTES.WARDEN.COMPLAINTS, iconName: 'AlertTriangle', category: 'Hostel' },
      { title: 'Maintenance Tickets', href: APP_ROUTES.WARDEN.MAINTENANCE, iconName: 'Wrench', category: 'Hostel' },
      { title: 'Hostel Analytics', href: APP_ROUTES.WARDEN.ANALYTICS, iconName: 'BarChart2', category: 'General' },
      { title: 'AI Insights & Forecasts', href: APP_ROUTES.AI_INSIGHTS.ROOT, iconName: 'BrainCircuit', category: 'General' },
      { title: 'Hostel Reports', href: APP_ROUTES.WARDEN.REPORTS, iconName: 'FileText', category: 'General' },
    ],
  },
};
