# Phase 23 — Principal Institution Dashboard

## 1. Purpose

The Principal Institution Dashboard provides the authenticated Principal with an executive, institution-wide read-only overview of the academic and residential health of their authorized institution. It aggregates high-level metrics across departments, students, faculty, programs, subjects, physical academic assets, resource requisitions, room/lab allocations, hostel occupancy, pending approvals, and institutional audit logs.

Unlike the HOD dashboard which is scoped to a specific academic department, the Principal dashboard provides institution-level visibility.

---

## 2. Frontend Route & Layout

- **Route:** `/principal/dashboard`
- **Layout:** Reuses the existing `PrincipalLayout` shell with topbar, responsive sidebar, breadcrumbs, and user profile display.
- **Components:**
  - `PrincipalInstitutionHeader`: Institution identity, status, principal details, contact info, and mini-metric counters.
  - `PrincipalKpiCards`: 11 high-level KPI cards covering departments, students, faculty, programs, subjects, academic resources, pending requests, active allocations, hostels, bed capacity/occupancy, and pending approvals.
  - `PrincipalDepartmentTable`: Institution-wide department table with search, sorting, and comparative metrics (students, faculty, programs, subjects, pending requests, active allocations).
  - `PrincipalAcademicCharts`: Interactive Recharts visualizations (Students by Department, Resource Status Distribution, Resource Request Breakdown) with strict zero-fake-data handling.
  - `PrincipalHostelOverviewCard`: Hostel operational health, bed status breakdown (Available, Occupied, Maintenance, Reserved, Inactive), and exact occupancy rate calculation.
  - `PrincipalApprovalsActivityCards`: Read-only pending approvals list and safe audit activity trail.

---

## 3. Backend API

### Endpoint:
```http
GET /api/principal/dashboard
```

### Authorization:
- Authenticated JWT token
- Role requirement: `ROLE_PRINCIPAL` (`@PreAuthorize("hasRole('PRINCIPAL')")`)
- Zero-trust frontend parameters: The Principal's authorized institution is strictly determined on the backend via `SecurityUtils.getCurrentUserId()` and resolved using `PrincipalInstitutionResolver`.

### Conceptual Response Structure:
```json
{
  "success": true,
  "message": "Principal institution dashboard retrieved successfully",
  "data": {
    "institution": {
      "id": 1,
      "name": "Apex Institute of Technology",
      "code": "AIT",
      "contactEmail": "contact@ait.edu",
      "contactPhone": "+91-9876543210",
      "status": "ACTIVE",
      "address": "Campus Ground, Knowledge City",
      "principalName": "Dr. Eleanor Vance",
      "principalEmail": "principal@ait.edu",
      "departmentCount": 6,
      "programCount": 14,
      "studentCount": 1240,
      "facultyCount": 86
    },
    "kpiSummary": {
      "totalDepartments": 6,
      "totalStudents": 1240,
      "totalFaculty": 86,
      "totalPrograms": 14,
      "totalSubjects": 180,
      "totalSections": 32,
      "academicResources": 48,
      "pendingResourceRequests": 4,
      "activeAllocations": 22,
      "totalHostels": 3,
      "totalHostelBeds": 500,
      "occupiedHostelBeds": 410,
      "pendingApprovals": 4
    },
    "departments": [...],
    "students": { ... },
    "faculty": { ... },
    "academicResources": { ... },
    "resourceRequests": { ... },
    "allocations": { ... },
    "hostel": {
      "totalHostels": 3,
      "totalRooms": 150,
      "totalBeds": 500,
      "occupiedBeds": 410,
      "availableBeds": 70,
      "maintenanceBeds": 15,
      "reservedBeds": 5,
      "inactiveBeds": 0,
      "occupancyRate": 85.4,
      "occupancyFormula": "(occupiedBeds / (occupiedBeds + availableBeds)) * 100"
    },
    "approvals": {
      "pendingCount": 4,
      "items": [...]
    },
    "recentActivity": [...]
  }
}
```

---

## 4. Institution Scoping & Security Flow

All database queries strictly resolve through the authenticated Principal's authorized `institution_id`:

```
JWT Token
   ↓
Authenticated Principal (User ID via SecurityUtils)
   ↓
PrincipalInstitutionResolver
   ├── 1. Active PrincipalAssignment (status = 'ACTIVE')
   ├── 2. Any PrincipalAssignment
   ├── 3. Faculty's department's institution
   └── 4. Single-institution fallback
   ↓
institution_id
   ├── Departments: departmentRepository.findByInstitutionId(id)
   ├── Students: studentRepository.countByDepartmentInstitutionId(id)
   ├── Faculty: facultyRepository.countByDepartmentInstitutionId(id)
   ├── Programs: programRepository.countByDepartmentInstitutionId(id)
   ├── Subjects: subjectRepository.countByProgramDepartmentInstitutionId(id)
   ├── Resources: resourceRepository.countByInstitutionId(id)
   ├── Requests: academicResourceRequestRepository.countByDepartmentInstitutionId(id)
   ├── Allocations: resourceAllocationRepository.countByDepartmentInstitutionId(id)
   ├── Hostels: hostelRepository.countByInstitutionId(id)
   ├── Hostel Beds: hostelBedRepository.countByRoomFloorBlockHostelInstitutionId(id)
   └── Audit Logs: auditLogRepository.findRecentInstitutionAuditLogs(id)
```

No frontend query parameter can bypass or override the institution scope. Access from non-principals yields HTTP 403 Forbidden; unauthenticated requests yield HTTP 401 Unauthorized.

---

## 5. Hostel Occupancy Calculation Formula

The dashboard avoids fabricated percentage changes and calculates occupancy only when usable beds exist:

$$\text{Usable Beds} = \text{Occupied Beds} + \text{Available Beds}$$

$$\text{Occupancy Rate (\%)} = \left( \frac{\text{Occupied Beds}}{\text{Usable Beds}} \right) \times 100$$

If total usable beds is 0, the metric is reported as `null` and displayed cleanly without erroneous division by zero.

---

## 6. Zero Fake Data Principle

- All metrics, charts, and tables display real database values only.
- No fabricated trends (e.g. `+12% this month` or random sparklines).
- If no records exist for a chart or category, clean empty states are displayed:
  - "No departments found."
  - "No student distribution data available."
  - "No academic resource data available."
  - "No resource request data available."
  - "No hostel occupancy data available."
  - "No pending approvals found."
  - "No recent institution activity."

---

## 7. Limitations & Exclusions (Strict Scope)

The following capabilities are **explicitly excluded** from Phase 23 and reserved for subsequent phases:
- ❌ Principal approval workflows and action triggers (e.g. Approve / Reject buttons). These belong to Phase 24.
- ❌ Resource allocation optimization algorithms and timetable generation engines.
- ❌ Automatic conflict detection and predictive analytics.
- ❌ Artificial Intelligence (AI) and Machine Learning models.
- ❌ Direct CRUD management of hostels, wards, or institution master records from the dashboard.
- ❌ Department ranking or artificial "performance score" classification.

---

## 8. Verification & Tests

### Backend Unit & Security Tests:
1. `PrincipalDashboardSecurityTest`:
   - Validates that an authenticated Principal receives HTTP 200 with structured dashboard response.
   - Validates that unauthenticated requests throw `UnauthorizedException` (HTTP 401).
2. `PrincipalDashboardServiceTest`:
   - Validates institution-scoped data aggregation across all repositories.
   - Validates access rejection (`AccessDeniedException`) if no authorized institution is resolved.
   - Validates clean handling of empty institutions without runtime errors or fake data fabrication.
3. Regression Test:
   - All HOD dashboard and security tests (`HodDashboardSecurityTest`, `HodDashboardServiceTest`) remain passing with 0 failures.

### Frontend Verification:
- TypeScript compilation (`tsc -b`) and Vite production build (`vite build`) completed with 0 errors.
