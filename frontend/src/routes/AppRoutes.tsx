import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';
import { APP_ROUTES } from '../constants/routes';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout';
import { PrincipalLayout } from '../layouts/PrincipalLayout';
import { HODLayout } from '../layouts/HODLayout';
import { FacultyLayout } from '../layouts/FacultyLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { WardenLayout } from '../layouts/WardenLayout';

// Auth & Error Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { UnauthorizedPage } from '../components/common/UnauthorizedPage';
import { NotFoundPage } from '../components/common/NotFoundPage';

// Dashboards
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserDirectoryPage } from '../pages/admin/UserDirectoryPage';
import { StudentManagementPage } from '../pages/admin/StudentManagementPage';
import { StaffManagementPage } from '../pages/admin/StaffManagementPage';
import { AcademicManagementPage } from '../pages/admin/AcademicManagementPage';
import { ResourceManagementPage } from '../pages/admin/ResourceManagementPage';
import { PrincipalDashboard } from '../pages/principal/PrincipalDashboard';
import { PrincipalMonitoringPage } from '../pages/principal/PrincipalMonitoringPage';
import { PrincipalApprovalsPage } from '../pages/principal/PrincipalApprovalsPage';
import { PrincipalApprovalDetailPage } from '../pages/principal/PrincipalApprovalDetailPage';
import { PrincipalResourceRequestsPage } from '../pages/principal/PrincipalResourceRequestsPage';
import { PrincipalAllocationsPage } from '../pages/principal/PrincipalAllocationsPage';
import {
  HODDashboard,
  HODFacultyPage,
  HODStudentsPage,
  HODWorkloadPage,
  HODResourceRequestsPage,
  HODAllocationsPage,
} from '../pages/hod';
import { FacultyDashboard } from '../pages/faculty/FacultyDashboard';
import { FacultyProfilePage } from '../pages/faculty/FacultyProfilePage';
import { FacultyAcademicsPage } from '../pages/faculty/FacultyAcademicsPage';
import { FacultySubjectsPage } from '../pages/faculty/FacultySubjectsPage';
import { FacultySubjectDetailsPage } from '../pages/faculty/FacultySubjectDetailsPage';
import { FacultyTimetablePage } from '../pages/faculty/FacultyTimetablePage';
import { FacultyWorkloadPage } from '../pages/faculty/FacultyWorkloadPage';
import { FacultyResourceRequestsPage } from '../pages/faculty/FacultyResourceRequestsPage';
import { CreateFacultyResourceRequestPage } from '../pages/faculty/CreateFacultyResourceRequestPage';
import { FacultyResourceRequestDetailsPage } from '../pages/faculty/FacultyResourceRequestDetailsPage';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentAcademicsPage } from '../pages/student/StudentAcademicsPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentResourceRequestsPage } from '../pages/student/StudentResourceRequestsPage';
import { StudentHostelPage } from '../pages/student/StudentHostelPage';
import { StudentHostelRequestsPage } from '../pages/student/StudentHostelRequestsPage';
import { StudentHostelComplaintsPage } from '../pages/student/StudentHostelComplaintsPage';
import { WardenDashboard } from '../pages/warden/WardenDashboard';
import { WardenRoomsPage } from '../pages/warden/WardenRoomsPage';
import { WardenRoomDetailPage } from '../pages/warden/WardenRoomDetailPage';
import { WardenBedsPage } from '../pages/warden/WardenBedsPage';
import { WardenAllocationsPage } from '../pages/warden/WardenAllocationsPage';
import { WardenAllocationDetailPage } from '../pages/warden/WardenAllocationDetailPage';
import { WardenCreateAllocationPage } from '../pages/warden/WardenCreateAllocationPage';
import { WardenResourcesPage } from '../pages/warden/WardenResourcesPage';
import { WardenComplaintsPage } from '../pages/warden/WardenComplaintsPage';
import { WardenComplaintDetailPage } from '../pages/warden/WardenComplaintDetailPage';
import { WardenMaintenancePage } from '../pages/warden/WardenMaintenancePage';
import { WardenMaintenanceDetailPage } from '../pages/warden/WardenMaintenanceDetailPage';
import { WardenCreateMaintenancePage } from '../pages/warden/WardenCreateMaintenancePage';
import { AcademicAllocationsPage } from '../pages/academic/AcademicAllocationsPage';
import { AcademicAllocationDetailPage } from '../pages/academic/AcademicAllocationDetailPage';
import { HostelAllocationsPage } from '../pages/hostel/HostelAllocationsPage';
import { HostelAllocationDetailPage } from '../pages/hostel/HostelAllocationDetailPage';
import { ApprovalCenterPage } from '../pages/approval/ApprovalCenterPage';
import { AnalyticsDashboardPage } from '../pages/analytics/AnalyticsDashboardPage';
import { AiInsightsPage } from '../pages/ai/AiInsightsPage';

// Newly Implemented Functional Pages
import { AdminHostelsPage } from '../pages/admin/AdminHostelsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { HODCoursesPage } from '../pages/hod/HODCoursesPage';
import { HODResourcesPage } from '../pages/hod/HODResourcesPage';
import { HODTimetablePage } from '../pages/hod/HODTimetablePage';
import { FacultyResourcesPage } from '../pages/faculty/FacultyResourcesPage';
import { StudentCoursesPage } from '../pages/student/StudentCoursesPage';
import { StudentTimetablePage } from '../pages/student/StudentTimetablePage';
import { StudentResourcesPage } from '../pages/student/StudentResourcesPage';
import { WardenHostelsPage } from '../pages/warden/WardenHostelsPage';
import { WardenBlocksPage } from '../pages/warden/WardenBlocksPage';
import { WardenStudentsPage } from '../pages/warden/WardenStudentsPage';

// Guards & Subpage Helper
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { SubpagePlaceholder } from '../pages/common/SubpagePlaceholder';

import {
  Users,
  Building2,
  Hotel,
  Layers,
  BarChart3,
  FileText,
  Settings,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  KeyRound,
  CheckSquare,
  TrendingUp,
  BookOpen,
  CalendarRange,
  Clock,
  BarChart2,
  Activity,
  Send,
  User,
  AlertCircle,
  FileQuestion,
  Building,
  Grid,
  BedDouble,
  Wifi,
  AlertTriangle,
  Wrench,
} from 'lucide-react';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to={APP_ROUTES.LOGIN} replace />} />

      {/* Public Routes */}
      <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={APP_ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* ========================================================================= */}
      {/* 1. ADMIN ROUTES                                                           */}
      {/* ========================================================================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserDirectoryPage />} />
        <Route path="students" element={<StudentManagementPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="staff/:id" element={<StaffManagementPage />} />
        <Route path="faculty" element={<StaffManagementPage initialTab="faculty" />} />
        <Route path="hods" element={<StaffManagementPage initialTab="hod" />} />
        <Route path="principal" element={<StaffManagementPage initialTab="principal" />} />
        <Route path="wardens" element={<StaffManagementPage initialTab="warden" />} />
        <Route path="academic" element={<AcademicManagementPage />} />
        <Route path="academic/:tab" element={<AcademicManagementPage />} />
        <Route path="departments" element={<AcademicManagementPage initialTab="departments" />} />
        <Route path="resources" element={<ResourceManagementPage />} />
        <Route path="resources/:tab" element={<ResourceManagementPage />} />
        <Route path="resources/list" element={<ResourceManagementPage initialTab="resources" />} />
        <Route path="resources/categories" element={<ResourceManagementPage initialTab="categories" />} />
        <Route path="resources/classrooms" element={<ResourceManagementPage initialTab="classrooms" />} />
        <Route path="resources/laboratories" element={<ResourceManagementPage initialTab="laboratories" />} />
        <Route path="resources/equipment" element={<ResourceManagementPage initialTab="equipment" />} />
        <Route path="resources/time-slots" element={<ResourceManagementPage initialTab="time-slots" />} />
        <Route path="allocations" element={<AcademicAllocationsPage />} />
        <Route path="allocations/:id" element={<AcademicAllocationDetailPage />} />
        <Route path="hostels" element={<AdminHostelsPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="ai-insights" element={<AiInsightsPage />} />
        <Route path="reports" element={<AnalyticsDashboardPage initialTab="reports" />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 2. PRINCIPAL ROUTES                                                       */}
      {/* ========================================================================= */}
      <Route
        path="/principal"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.PRINCIPAL]}>
              <PrincipalLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PrincipalDashboard />} />
        <Route path="monitoring" element={<PrincipalMonitoringPage />} />
        <Route path="approvals" element={<PrincipalApprovalsPage />} />
        <Route path="approvals/:id" element={<PrincipalApprovalDetailPage />} />
        <Route path="resource-requests" element={<PrincipalResourceRequestsPage />} />
        <Route path="departments" element={<PrincipalMonitoringPage />} />
        <Route path="resources" element={<PrincipalAllocationsPage />} />
        <Route path="allocations" element={<PrincipalAllocationsPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="ai-insights" element={<AiInsightsPage />} />
        <Route path="reports" element={<AnalyticsDashboardPage initialTab="reports" />} />
      </Route>

      {/* ========================================================================= */}
      {/* 3. HOD ROUTES                                                             */}
      {/* ========================================================================= */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.HOD]}>
              <HODLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HODDashboard />} />
        <Route path="faculty" element={<HODFacultyPage />} />
        <Route path="students" element={<HODStudentsPage />} />
        <Route path="workload" element={<HODWorkloadPage />} />
        <Route path="courses" element={<HODCoursesPage />} />
        <Route path="resources" element={<HODResourcesPage />} />
        <Route path="resource-requests" element={<HODResourceRequestsPage />} />
        <Route path="resource-requests/:id" element={<HODResourceRequestsPage />} />
        <Route path="allocations" element={<HODAllocationsPage />} />
        <Route path="allocations/:id" element={<HODAllocationsPage />} />
        <Route path="timetable" element={<HODTimetablePage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage initialTab="academic" />} />
        <Route path="ai-insights" element={<AiInsightsPage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 4. FACULTY ROUTES                                                         */}
      {/* ========================================================================= */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.FACULTY]}>
              <FacultyLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="profile" element={<FacultyProfilePage />} />
        <Route path="academics" element={<FacultyAcademicsPage />} />
        <Route path="courses" element={<FacultyAcademicsPage />} />
        <Route path="subjects" element={<FacultySubjectsPage />} />
        <Route path="subjects/:id" element={<FacultySubjectDetailsPage />} />
        <Route path="timetable" element={<FacultyTimetablePage />} />
        <Route path="workload" element={<FacultyWorkloadPage />} />
        <Route path="resource-requests" element={<FacultyResourceRequestsPage />} />
        <Route path="resource-requests/new" element={<CreateFacultyResourceRequestPage />} />
        <Route path="resource-requests/:id" element={<FacultyResourceRequestDetailsPage />} />
        <Route path="requests" element={<Navigate to="/faculty/resource-requests" replace />} />
        <Route path="resources" element={<FacultyResourcesPage />} />
        <Route path="ai-insights" element={<AiInsightsPage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 5. STUDENT ROUTES                                                         */}
      {/* ========================================================================= */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.STUDENT]}>
              <StudentLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="academics" element={<StudentAcademicsPage />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="timetable" element={<StudentTimetablePage />} />
        <Route path="resources" element={<StudentResourcesPage />} />
        <Route path="requests" element={<StudentResourceRequestsPage />} />
        <Route path="requests/new" element={<StudentResourceRequestsPage />} />
        <Route path="requests/:id" element={<StudentResourceRequestsPage />} />
        <Route path="hostel" element={<StudentHostelPage />} />
        <Route path="hostel/requests" element={<StudentHostelRequestsPage />} />
        <Route path="hostel/requests/new" element={<StudentHostelRequestsPage />} />
        <Route path="hostel/requests/:id" element={<StudentHostelRequestsPage />} />
        <Route path="hostel-requests" element={<StudentHostelRequestsPage />} />
        <Route path="hostel/complaints" element={<StudentHostelComplaintsPage />} />
        <Route path="hostel/complaints/new" element={<StudentHostelComplaintsPage />} />
        <Route path="hostel/complaints/:id" element={<StudentHostelComplaintsPage />} />
        <Route path="complaints" element={<StudentHostelComplaintsPage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 6. WARDEN ROUTES                                                          */}
      {/* ========================================================================= */}
      <Route
        path="/warden"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.WARDEN]}>
              <WardenLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<WardenDashboard />} />
        <Route path="hostels" element={<WardenHostelsPage />} />
        <Route path="blocks" element={<WardenBlocksPage />} />
        <Route path="rooms" element={<WardenRoomsPage />} />
        <Route path="rooms/:roomId" element={<WardenRoomDetailPage />} />
        <Route path="beds" element={<WardenBedsPage />} />
        <Route path="students" element={<WardenStudentsPage />} />
        <Route path="allocations" element={<WardenAllocationsPage />} />
        <Route path="allocations/new" element={<WardenCreateAllocationPage />} />
        <Route path="allocations/:allocationId" element={<WardenAllocationDetailPage />} />
        <Route path="resources" element={<WardenResourcesPage />} />
        <Route path="complaints" element={<WardenComplaintsPage />} />
        <Route path="complaints/:id" element={<WardenComplaintDetailPage />} />
        <Route path="maintenance" element={<WardenMaintenancePage />} />
        <Route path="maintenance/new" element={<WardenCreateMaintenancePage />} />
        <Route path="maintenance/:id" element={<WardenMaintenanceDetailPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage initialTab="hostel" />} />
        <Route path="ai-insights" element={<AiInsightsPage />} />
        <Route path="reports" element={<AnalyticsDashboardPage initialTab="reports" />} />
      </Route>

      {/* ========================================================================= */}
      {/* 7. ACADEMIC RESOURCE ALLOCATION ENGINE                                    */}
      {/* ========================================================================= */}
      <Route
        path="/academic"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.HOD, ROLES.FACULTY]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="allocations" element={<AcademicAllocationsPage />} />
        <Route path="allocations/:id" element={<AcademicAllocationDetailPage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 8. HOSTEL RESOURCE ALLOCATION ENGINE                                      */}
      {/* ========================================================================= */}
      <Route
        path="/hostel"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.WARDEN]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route path="resource-allocations" element={<HostelAllocationsPage />} />
        <Route path="resource-allocations/:id" element={<HostelAllocationDetailPage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 9. CENTRALIZED APPROVAL WORKFLOW & TRACKING (PHASE 32)                    */}
      {/* ========================================================================= */}
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.HOD, ROLES.WARDEN]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<ApprovalCenterPage />} />
        <Route path="pending" element={<ApprovalCenterPage />} />
        <Route path=":id" element={<ApprovalCenterPage />} />
      </Route>

      {/* ========================================================================= */}
      {/* 10. CENTRALIZED ANALYTICS & REPORTS (PHASE 33)                            */}
      {/* ========================================================================= */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.HOD, ROLES.WARDEN, ROLES.FACULTY, ROLES.STUDENT]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<AnalyticsDashboardPage />} />
      </Route>
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.HOD, ROLES.WARDEN]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<AnalyticsDashboardPage initialTab="reports" />} />
      </Route>

      {/* ========================================================================= */}
      {/* 11. CENTRALIZED AI INSIGHTS & FORECASTS (PHASE 34)                         */}
      {/* ========================================================================= */}
      <Route
        path="/ai-insights"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.HOD, ROLES.WARDEN, ROLES.FACULTY]}>
              <AdminLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<AiInsightsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
