/**
 * TypeScript definitions for the Admin Dashboard and System Overview
 */

export interface UserDistribution {
  totalUsers: number;
  adminCount: number;
  principalCount: number;
  hodCount: number;
  facultyCount: number;
  studentCount: number;
  wardenCount: number;
}

export interface AcademicResourceOverview {
  totalResources: number;
  available: number;
  allocated: number;
  maintenance: number;
  inactive: number;
  utilizationRate: number;
}

export interface HostelResourceOverview {
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;
  usableBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
  inactiveBeds: number;
  occupancyRate: number;
}

export interface RequestSummary {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  cancelled: number;
}

export interface AllocationSummary {
  totalAllocations: number;
  active: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export interface ApprovalSummary {
  totalApprovals: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

export interface RecentActivityItem {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  username: string;
  timestamp: string;
}

export interface AdminDashboardOverview {
  totalUsers: number;
  totalDepartments: number;
  activeDepartments: number;
  totalAcademicResources: number;
  totalHostelResources: number;
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;

  pendingRequests: number;
  activeAllocations: number;
  pendingApprovals: number;
  openIssues: number;
  openComplaints: number;
  openMaintenanceRequests: number;

  userDistribution: UserDistribution;
  academicResourceOverview: AcademicResourceOverview;
  hostelResourceOverview: HostelResourceOverview;
  requestSummary: RequestSummary;
  allocationSummary: AllocationSummary;
  approvalSummary: ApprovalSummary;
  recentActivities: RecentActivityItem[];
}
