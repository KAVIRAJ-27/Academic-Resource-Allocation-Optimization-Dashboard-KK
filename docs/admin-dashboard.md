# AHRAO Phase 5 — Admin Dashboard & Overall System Overview

## 1. Dashboard Purpose

The Admin Dashboard is the central institution-wide command center for AHRAO (Academic & Hostel Resource Allocation Optimization Dashboard). It provides an aggregated, real-time operational overview across both operational pillars:

1. **Academic Resource Management** (Users, Departments, Classrooms, Laboratories, Requests, Allocations, Approvals)
2. **Hostel Resource Management** (Hostel Buildings, Blocks, Rooms, Beds, Capacity, Complaints, Maintenance)

It delivers immediate answers to essential institutional governance questions:

- How many total users are registered across all six roles?
- What is the current status of academic infrastructure and its utilization?
- What is the usable residential bed capacity and occupancy rate?
- How many resource requests, allocations, and approvals are in the pipeline?
- Are there open student complaints or maintenance work orders requiring administrative intervention?
- What recent administrative actions or authentication events have occurred?

---

## 2. Authorization Requirements

- **Role Requirement**: `ROLE_ADMIN`
- **Backend Protection**:
  - Class-level `@PreAuthorize("hasRole('ADMIN')")` on `AdminDashboardController`
  - Spring Security request matcher: `.requestMatchers(SecurityConstants.ADMIN_URLS).hasRole("ADMIN")`
  - Unauthenticated access returns `401 Unauthorized`
  - Non-admin roles (`PRINCIPAL`, `HOD`, `FACULTY`, `STUDENT`, `WARDEN`) return `403 Forbidden`
- **Frontend Route Protection**:
  - Route `/admin/dashboard` is guarded by `<ProtectedRoute>` and `<RoleGuard allowedRoles={[ROLES.ADMIN]}>`

---

## 3. API Endpoints

### 3.1 Primary Overview Endpoint

- **URL**: `GET /api/admin/dashboard/overview`
- **Produces**: `application/json`
- **Response Structure**:

```json
{
  "success": true,
  "message": "Admin dashboard overview retrieved successfully",
  "data": {
    "totalUsers": 150,
    "totalDepartments": 6,
    "activeDepartments": 5,
    "totalAcademicResources": 40,
    "totalHostelResources": 4,
    "totalHostels": 4,
    "totalRooms": 100,
    "totalBeds": 200,
    "pendingRequests": 7,
    "activeAllocations": 128,
    "pendingApprovals": 5,
    "openIssues": 5,
    "openComplaints": 2,
    "openMaintenanceRequests": 3,
    "userDistribution": {
      "totalUsers": 150,
      "adminCount": 2,
      "principalCount": 1,
      "hodCount": 5,
      "facultyCount": 30,
      "studentCount": 110,
      "wardenCount": 2
    },
    "academicResourceOverview": {
      "totalResources": 40,
      "available": 25,
      "allocated": 10,
      "maintenance": 3,
      "inactive": 2,
      "utilizationRate": 28.6
    },
    "hostelResourceOverview": {
      "totalHostels": 4,
      "totalRooms": 100,
      "totalBeds": 200,
      "usableBeds": 180,
      "occupiedBeds": 120,
      "availableBeds": 50,
      "maintenanceBeds": 10,
      "reservedBeds": 10,
      "inactiveBeds": 10,
      "occupancyRate": 66.7
    },
    "requestSummary": {
      "totalRequests": 15,
      "pending": 7,
      "approved": 5,
      "rejected": 2,
      "completed": 1,
      "cancelled": 0
    },
    "allocationSummary": {
      "totalAllocations": 140,
      "active": 128,
      "pending": 4,
      "completed": 6,
      "cancelled": 2
    },
    "approvalSummary": {
      "totalApprovals": 12,
      "pending": 5,
      "approved": 5,
      "rejected": 2,
      "cancelled": 0
    },
    "recentActivities": [
      {
        "id": 101,
        "action": "CREATE_USER",
        "entityType": "USER",
        "entityId": 42,
        "description": "CREATE USER on USER #42",
        "username": "admin_sys",
        "timestamp": "2026-09-05T14:10:00Z"
      }
    ]
  },
  "timestamp": "2026-09-05T14:15:00Z"
}
```

### 3.2 Auxiliary Sub-Endpoints

- `GET /api/admin/dashboard/user-distribution`
- `GET /api/admin/dashboard/academic-summary`
- `GET /api/admin/dashboard/hostel-summary`

---

## 4. KPI Definitions & Calculations

| Metric | Database Source | Calculation Rule |
| --- | --- | --- |
| **Total Users** | `users` table | `COUNT(*)` across all active/inactive users |
| **Total Departments** | `departments` table | `COUNT(*)` across all departments |
| **Active Departments** | `departments` table | `COUNT(*) WHERE status = 'ACTIVE'` |
| **Total Academic Resources** | `resources` table | `COUNT(*)` across classrooms, labs, equipment |
| **Academic Utilization Rate** | `resources` table | `(allocated / (available + allocated)) * 100` (or `0.0` if denominator is 0) |
| **Total Hostels / Rooms / Beds** | `hostels`, `hostel_rooms`, `hostel_beds` | Direct SQL `COUNT(*)` aggregates |
| **Usable Bed Capacity** | `hostel_beds` table | `available + occupied + reserved` (excludes `INACTIVE` and `MAINTENANCE`) |
| **Hostel Occupancy Rate** | `hostel_beds` table | `(occupied / usableBeds) * 100` (or `0.0` if usableBeds is 0) |
| **Pending Requests** | `academic_resource_requests` + `hostel_requests` | `COUNT(*) WHERE status = 'PENDING'` across academic & hostel domains |
| **Active Allocations** | `resource_allocations` + `hostel_allocations` | `COUNT(*) WHERE status = 'ACTIVE'` across physical rooms & beds |
| **Pending Approvals** | `approvals` table | `COUNT(*) WHERE status = 'PENDING'` |
| **Open Issues** | `hostel_complaints` + `maintenance_requests` | Complaints in `['OPEN', 'IN_PROGRESS']` + Maintenance in `['OPEN', 'ASSIGNED', 'IN_PROGRESS']` |

---

## 5. Resource & Bed Status Definitions

### 5.1 Academic ResourceStatus (`ResourceStatus` enum)

- `AVAILABLE`: Space or equipment ready for allocation.
- `ALLOCATED`: Space actively booked for classes, labs, or events.
- `MAINTENANCE`: Hardware damaged or undergoing physical repair.
- `INACTIVE`: Decommissioned or off-season asset.

### 5.2 Hostel BedStatus (`HostelBedStatus` enum)

- `AVAILABLE`: Vacant and verified for student assignment.
- `OCCUPIED`: Actively assigned to a registered student resident.
- `RESERVED`: Held for incoming cohort or administrative quota.
- `MAINTENANCE`: Bed or room damaged, undergoing civil/electrical work.
- `INACTIVE`: Room decommissioned or permanently blocked.

---

## 6. Frontend Component Hierarchy

```text
AdminDashboard.tsx
├── PageHeader (Breadcrumbs, title, telemetry badge, refresh button, export report)
├── AdminKpiGrid (4 Headline StatCards with real counts and skeleton loaders)
├── AdminOperationalStats (4 Queue StatCards for pending requests, allocations, approvals, issues)
├── DashboardGrid (charts)
│   ├── AcademicUtilizationChart (Recharts Donut chart with real counts and empty state)
│   └── HostelOccupancyChart (Recharts Donut chart with real counts and empty state)
├── ResourceStatusBreakdown (Request status pipeline & allocation lifecycle progress bars)
├── DashboardGrid (split 1:2)
│   ├── OpenIssuesSummary (Open complaints vs open maintenance orders)
│   └── RecentActivityFeed (Top 10 immutable audit log entries with relative timestamps)
└── AdminQuickActions (Links to active modules and subpages)
```

---

## 7. No Fake Analytics Policy Verification

- If database tables contain 0 records, the dashboard displays `"0"` or `"No data available"` without errors.
- Utilization and occupancy percentages calculate strictly from non-zero denominators.
- No static or fabricated percentage arrays are hardcoded in charts or KPI cards.
