# AHRAO Phase 20 — HOD Department Dashboard

## 1. Dashboard Purpose
The HOD (Head of Department) Dashboard is the dedicated operational command center for departmental leadership within the AHRAO system. It delivers a real-time, comprehensive overview of the HOD's own department using actual database queries, enforcing strict department scoping derived solely from the authenticated user's JWT principal.

Key capabilities provided to the HOD:
1. **Department Information & Active HOD Details**: Department name, code, status, institution affiliation, and active HOD tenure metadata.
2. **Key Metric Indicators (KPIs)**:
   - Total Students enrolled in department programs
   - Total Faculty assigned to the department
   - Total Programs / Degree offerings
   - Total Subjects in curriculum
   - Active Sections / Cohorts
   - Pending Academic Resource Requests
   - Active Academic Resource Allocations
   - Total Department Resources (laboratories, smart classrooms, equipment)
3. **Student Enrollment Distribution**: Cohort strength grouped by academic program with Recharts visualization and percentage distribution.
4. **Faculty Workload Overview**: Faculty roster with assigned course counts, weekly total/teaching/lab hours, and workload status badges (`OVERLOAD`, `BALANCED`, `UNDERLOAD`, `PENDING_CALCULATION`).
5. **Pending Resource Requests**: Department faculty resource requisitions awaiting processing.
6. **Active Academic Resource Allocations**: Currently engaged departmental spaces and equipment with time windows and beneficiaries.
7. **Department Resource Utilization Overview**: Real-time breakdown of resources (Available, Allocated, Maintenance, Inactive) and overall utilization index.
8. **Recent Department Activity Audit Log**: Live audit telemetry stream tracking operational events within the department.
9. **Quick Action Workspace Navigation**: Direct links to Department Faculty, Students, Allocations, Resources, Timetables, and Curriculum.

---

## 2. Authorization & Scoping Architecture

### 2.1 Identity & Department Resolution
The system enforces strict multi-tenant department isolation:
- **Never accepts `departmentId` or `hodId` from request parameters or body.**
- Reads `userId` strictly from Spring Security Context: `SecurityUtils.getCurrentUserId()`.
- Resolves the HOD's `Faculty` entity: `facultyRepository.findByUserId(userId)`.
- Resolves the HOD's active `DepartmentHOD` assignment:
  `departmentHODRepository.findFirstByFacultyUserIdAndStatus(userId, "ACTIVE")`.
- Fallback: checks `faculty.getDepartment()` if no explicit `DepartmentHOD` row exists.
- If neither exists, access is refused with `403 Forbidden` (`"No active department assignment found for authenticated HOD."`).

### 2.2 Security Controls
- **Endpoint Protection**: Class-level `@PreAuthorize("hasRole('HOD')")` on `HodDashboardController`.
- **Unauthenticated Access**: Throws `UnauthorizedException` (`401`).
- **Non-HOD / Unauthorized Roles**: Throws `AccessDeniedException` / `ForbiddenException` (`403`).
- **Frontend Route Protection**: Route `/hod/dashboard` is protected by `RoleGuard` permitting only `HOD`.

---

## 3. API Specification

### 3.1 Primary Endpoint
- **URL**: `GET /api/hod/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT>`
- **Response Format**: `ApiResponse<HodDashboardResponse>`

### 3.2 Sample Response
```json
{
  "success": true,
  "message": "HOD department dashboard retrieved successfully",
  "data": {
    "department": {
      "id": 10,
      "name": "Computer Science & Engineering",
      "code": "CSE",
      "status": "ACTIVE",
      "institutionName": "Global Institute of Technology",
      "hodName": "Dr. Alan Turing",
      "hodEmail": "alan.turing@univ.edu",
      "hodEmployeeId": "EMP-CSE-001",
      "hodSince": "2022-06-01"
    },
    "summary": {
      "totalStudents": 180,
      "totalFaculty": 15,
      "totalPrograms": 3,
      "totalSubjects": 24,
      "activeSections": 8,
      "pendingResourceRequests": 4,
      "activeResourceAllocations": 6,
      "totalDepartmentResources": 12
    },
    "studentDistribution": [
      {
        "programId": 1,
        "programCode": "BTECH-CSE",
        "programName": "B.Tech Computer Science",
        "degreeType": "UNDERGRADUATE",
        "studentCount": 120,
        "percentage": 66.7
      },
      {
        "programId": 2,
        "programCode": "MTECH-CSE",
        "programName": "M.Tech Computer Science",
        "degreeType": "POSTGRADUATE",
        "studentCount": 60,
        "percentage": 33.3
      }
    ],
    "facultyWorkloads": [
      {
        "facultyId": 202,
        "facultyName": "Ada Lovelace",
        "employeeId": "EMP-CSE-002",
        "designation": "Assistant Professor",
        "totalHours": 16.0,
        "teachingHours": 12.0,
        "labHours": 4.0,
        "assignedSubjectsCount": 3,
        "workloadStatus": "BALANCED"
      }
    ],
    "pendingRequests": [
      {
        "requestId": 301,
        "resourceName": "Lab 3 - Data Science",
        "resourceCode": "LAB-301",
        "resourceCategoryName": "Academic Resource",
        "requesterName": "Ada Lovelace",
        "purpose": "AI Lab Session",
        "requestedDate": "2026-09-07",
        "startTime": "09:00:00",
        "endTime": "11:00:00",
        "priority": "HIGH",
        "status": "PENDING",
        "createdAt": "2026-09-06T05:00:00Z"
      }
    ],
    "activeAllocations": [
      {
        "allocationId": 401,
        "resourceName": "Lab 3 - Data Science",
        "resourceCode": "LAB-301",
        "resourceCategoryName": "Academic Resource",
        "allocatedToName": "Ada Lovelace",
        "allocatedToRole": "FACULTY",
        "purpose": "Semester End Practical Examination",
        "startDatetime": "2026-09-06T09:00:00Z",
        "endDatetime": "2026-09-06T11:00:00Z",
        "quantity": 1,
        "status": "ACTIVE"
      }
    ],
    "resourceUtilization": {
      "totalResources": 12,
      "availableCount": 7,
      "allocatedCount": 3,
      "maintenanceCount": 1,
      "inactiveCount": 1,
      "utilizationRate": 25.0
    },
    "recentActivities": [
      {
        "id": 501,
        "action": "ALLOCATION_CREATED",
        "entityType": "ResourceAllocation",
        "entityId": 401,
        "description": "ALLOCATION CREATED on ResourceAllocation #401",
        "performedBy": "Dr. Alan Turing",
        "createdAt": "2026-09-06T05:15:00Z"
      }
    ]
  },
  "timestamp": "2026-09-06T05:25:00Z"
}
```

---

## 4. Database Queries & Optimization

| Telemetry Component | Query / Method | Scope |
| :--- | :--- | :--- |
| **Total Students** | `studentRepository.countByDepartmentId(deptId)` | Department |
| **Total Faculty** | `facultyRepository.countByDepartmentId(deptId)` | Department |
| **Total Programs** | `programRepository.countByDepartmentId(deptId)` | Department |
| **Total Subjects** | `subjectRepository.countByProgramDepartmentId(deptId)` | Department |
| **Active Sections** | `sectionRepository.countByProgramDepartmentIdAndStatus(deptId, "ACTIVE")` | Department |
| **Pending Requests** | `academicResourceRequestRepository.countByDepartmentIdAndStatus(deptId, PENDING)` | Department |
| **Active Allocations** | `resourceAllocationRepository.countByDepartmentIdAndStatus(deptId, ACTIVE)` | Department |
| **Department Resources** | `resourceRepository.countByDepartmentId(deptId)` | Department |
| **Student Distribution** | `studentRepository.countStudentsGroupedByProgramInDepartment(deptId)` | Department |
| **Pending Requests List** | `academicResourceRequestRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc` | Department |
| **Active Allocations List** | `resourceAllocationRepository.findTop5ByDepartmentIdAndStatusOrderByCreatedAtDesc` | Department |
| **Resource Utilization** | `resourceRepository.countByDepartmentIdAndStatus` | Department |
| **Recent Activity Feed** | `auditLogRepository.findRecentDepartmentAuditLogs(deptId, PageRequest.of(0, 10))` | Department Users |

---

## 5. Frontend Architecture & Components

The frontend is implemented under `frontend/src/components/hod/dashboard/` and consumed by `frontend/src/pages/hod/HODDashboard.tsx`:

- **`HodDepartmentHeader`**: Hero card with live department metadata, status badges, HOD profile details, and interactive live refresh trigger.
- **`HodKpiGrid`**: 8 modular KPI cards displaying student strength, faculty roster, programs, subjects, active cohorts, pending requests, allocations, and resources.
- **`HodStudentDistributionChart`**: Recharts visual representation and breakdown list of students by academic degree program.
- **`HodFacultyWorkloadCard`**: Filterable/searchable faculty table highlighting teaching hours, course counts, and workload badges (`OVERLOAD`, `BALANCED`, etc.).
- **`HodPendingRequestsCard`**: Priority-coded pending resource requisitions with requester and time slot details.
- **`HodActiveAllocationsCard`**: Live facilities engagement overview showing current bookings.
- **`HodResourceUtilizationCard`**: Status progress gauge and count matrix (Available, Allocated, Maintenance, Inactive).
- **`HodRecentActivityCard`**: Real-time audit telemetry stream with relative time formatting.
- **`HodQuickActions`**: Direct module navigation to Faculty, Students, Allocations, Resources, Timetables, and Courses.
- **`HodDashboardSkeleton`**: Smooth animated placeholder layout during asynchronous live data acquisition.

---

## 6. Verification & Test Coverage

### 6.1 Backend Tests
- `HodDashboardSecurityTest`:
  - `testGetHodDashboardSuccess`: Verifies authenticated HOD access and data delivery.
  - `testUnauthenticatedAccessDenied`: Verifies rejection without valid security context.
- `HodDashboardServiceTest`:
  - `testGetHodDashboard_SuccessWithDepartmentHod`: Verifies metric aggregation with active `DepartmentHOD`.
  - `testGetHodDashboard_FallbackToFacultyDepartment`: Verifies graceful fallback to `faculty.getDepartment()`.
  - `testGetHodDashboard_NotFacultyThrowsForbidden`: Verifies rejection for non-faculty users.
  - `testGetHodDashboard_NoDepartmentThrowsForbidden`: Verifies rejection when no department is assigned.
  - `testGetHodDashboard_EmptyStatesHandledSafely`: Verifies safe execution with empty database tables.

All tests compile and execute cleanly with 100% pass rate.
