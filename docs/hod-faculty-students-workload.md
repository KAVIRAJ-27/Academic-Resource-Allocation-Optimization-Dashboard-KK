# AHRAO Phase 21 — HOD Faculty, Students & Workload Management

## 1. Module Purpose & Department Scope

Phase 21 establishes the dedicated department-level management and oversight module for the Head of Department (HOD) within the AHRAO system. It provides high-efficiency administration across:

1. **Department Faculty Management (`/hod/faculty`)**: Directory of teaching faculty affiliated with the HOD's department, comprehensive profile and assigned subjects detail view, and permitted status and profile updates.
2. **Department Student Management (`/hod/students`)**: Roster of enrolled students across departmental degree programs and cohort sections, dependent multi-level filtering, academic placement detail view, and permitted enrollment status and cohort updates.
3. **Faculty Workload & Academic Allocations (`/hod/workload`)**: Strictly read-only department workload overview, workload equilibrium distribution visualization (via Recharts), per-faculty teaching hours breakdown, and comprehensive faculty-course teaching assignment records.

### Critical Boundary Conditions & Security Model

- **Department Isolation**: The HOD is restricted exclusively to data belonging to their authorized department. Any attempt to inspect or mutate records belonging to a foreign department returns `403 Forbidden`.
- **Zero Frontend Parameter Trust**: The backend never accepts `hodId` or `departmentId` from query parameters, path variables, or request bodies. Identity and department authorization are derived strictly from the authenticated Spring Security JWT context:

  $$\text{JWT Principal} \longrightarrow \text{userId} \longrightarrow \text{Faculty} \longrightarrow \text{Active DepartmentHOD} \longrightarrow \text{Department}$$

- **Workload Read-Only Integrity**: In accordance with the Phase 21 specification, the workload module is strictly read-only. No manual workload overrides or artificial schema alterations are permitted.
- **Audit Logging**: Permitted modifications (`HOD_FACULTY_STATUS_CHANGED`, `HOD_FACULTY_UPDATED`, `HOD_STUDENT_STATUS_CHANGED`, `HOD_STUDENT_UPDATED`) create audit log records capturing the actor, target entity, previous/new states, and justifications.

---

## 2. Security Architecture & Scoping

```text
┌────────────────────────────────────────────────────────┐
│              Authenticated HTTP Request                │
│             Authorization: Bearer <JWT>                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Spring Security Context                    │
│   @PreAuthorize("hasRole('HOD')") Enforced             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              HodDepartmentResolver                     │
│  1. Extract userId via SecurityUtils.getCurrentUserId() │
│  2. Resolve Faculty via FacultyRepository              │
│  3. Resolve Active DepartmentHOD Assignment            │
│  4. Return Authorized Department Entity                │
└───────────────────────────┬────────────────────────────┘
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ Entity Belongs to Dept?  │  │ Entity Belongs to Other? │
│     department.getId()   │  │    department.getId()    │
│            ==            │  │            !=            │
│    target.getDept().getId│  │   target.getDept().getId │
└────────────┬─────────────┘  └────────────┬─────────────┘
             │                             │
             ▼                             ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Allow Operation        │  │ 403 Forbidden            │
│   (Return DTO / Update)  │  │ (Security Alert Logged)  │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 3. Backend API Specifications

### 3.1 Faculty Management Endpoints (`/api/hod/faculty`)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/hod/faculty` | `GET` | `ROLE_HOD` | Server-side paginated, searchable, status-filtered department faculty directory |
| `/api/hod/faculty/{id}` | `GET` | `ROLE_HOD` | Full details of a department faculty member (profile, assigned subjects, workload metrics, recent requests) |
| `/api/hod/faculty/{id}/status` | `PATCH` | `ROLE_HOD` | Update faculty account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING`) with audit logging |
| `/api/hod/faculty/{id}` | `PUT` | `ROLE_HOD` | Update permitted profile fields (`designation`, `qualification`, `specialization`, `phone`) |

#### Sample Request: Update Faculty Status

```http
PATCH /api/hod/faculty/12/status
Content-Type: application/json
Authorization: Bearer <JWT>

{
  "status": "INACTIVE",
  "reason": "Faculty member on medical leave for semester 1"
}
```

---

### 3.2 Student Management Endpoints (`/api/hod/students`)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/hod/students` | `GET` | `ROLE_HOD` | Server-side paginated department student roster with dependent filters |
| `/api/hod/students/{id}` | `GET` | `ROLE_HOD` | Full academic record, cohort section, degree program, hostel summary, and resource requests |
| `/api/hod/students/reference-data` | `GET` | `ROLE_HOD` | Department-scoped filter options: programs, sections, and academic cohorts |
| `/api/hod/students/{id}/status` | `PATCH` | `ROLE_HOD` | Update student enrollment status (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING`) with audit logging |
| `/api/hod/students/{id}` | `PUT` | `ROLE_HOD` | Update permitted student academic placement (`currentSemester`, `sectionId`, `rollNumber`) |

#### Dependent Filter Validation Rule

When a program or section filter is provided:

```java
if (programId != null) {
    Program program = programRepository.findById(programId)
        .orElseThrow(() -> new ResourceNotFoundException("Program", "id", programId));
    if (!program.getDepartment().getId().equals(department.getId())) {
        throw new ForbiddenException("Cannot filter by program outside authorized department");
    }
}
```

---

### 3.3 Workload Management Endpoints (`/api/hod/workload`)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/hod/workload` | `GET` | `ROLE_HOD` | Read-only department workload overview: summary metrics, workload distribution counts, and per-faculty load |
| `/api/hod/workload/{facultyId}` | `GET` | `ROLE_HOD` | Read-only granular breakdown of faculty teaching, lab, other hours, course assignments, and history |
| `/api/hod/workload/assignments` | `GET` | `ROLE_HOD` | Department-wide course-to-faculty academic assignment records |

---

## 4. Frontend Architecture

### 4.1 Routes & Navigation

- `/hod/faculty` &rarr; `HODFacultyPage` (mounted inside existing `HODLayout`)
- `/hod/students` &rarr; `HODStudentsPage` (mounted inside existing `HODLayout`)
- `/hod/workload` &rarr; `HODWorkloadPage` (mounted inside existing `HODLayout`)

### 4.2 Custom React Hooks

- `useHodFaculty`: Manages server-side pagination, debounced text search, status filtering, profile updates, status updates, and detail modal state.
- `useHodStudents`: Manages server-side pagination, debounced search, dependent program/section filters, reference data caching, status updates, placement updates, and detail modal state.
- `useHodWorkload`: Manages department workload metrics, distribution chart data, assignment list, and selected faculty workload breakdown modal.

### 4.3 UI Component Library

```text
frontend/src/components/hod/
├── faculty/
│   ├── HodFacultyKpiCards.tsx       # 4 summary metrics (Total, Active, Courses, Avg Workload)
│   ├── HodFacultyTable.tsx          # Searchable, filterable table with pagination
│   ├── HodFacultyDetailModal.tsx    # Profile, assigned courses, workload breakdown, requests
│   ├── HodEditFacultyModal.tsx      # Permitted designation, degree, and specialization updates
│   ├── HodChangeFacultyStatusModal.tsx # Account status change dialog with audit reason
│   └── index.ts
├── students/
│   ├── HodStudentKpiCards.tsx       # 4 student metrics (Total, Active, Programs, Sections)
│   ├── HodStudentTable.tsx          # Multi-filter student table with dependent dropdowns
│   ├── HodStudentDetailModal.tsx    # Academic placement, degree, hostel status, requests
│   ├── HodEditStudentModal.tsx      # Semester and section placement updates
│   ├── HodChangeStudentStatusModal.tsx # Enrollment status change dialog with audit reason
│   └── index.ts
└── workload/
    ├── HodWorkloadSummaryCards.tsx  # Workload metrics (Total, Logged, Avg Hours, Overloads)
    ├── HodWorkloadDistributionChart.tsx # Recharts bar chart showing load distribution
    ├── HodWorkloadTable.tsx         # Faculty workload table with hours and status badges
    ├── HodFacultyWorkloadDetailModal.tsx # Teaching/Lab/Other hours, courses, and history
    ├── HodAssignmentsTable.tsx      # Department course teaching allocations
    └── index.ts
```

---

## 5. Verification & Test Suite

### 5.1 Backend Security & Unit Tests

All 35 HOD tests passed with zero failures and zero errors:

- `HodDashboardSecurityTest`: Role enforcement and JWT authentication verification.
- `HodFacultySecurityTest`: Role verification and unauthorized rejection on `/api/hod/faculty/**`.
- `HodStudentSecurityTest`: Role verification and unauthorized rejection on `/api/hod/students/**`.
- `HodWorkloadSecurityTest`: Role verification and unauthorized rejection on `/api/hod/workload/**`.
- `HodDashboardServiceTest`: Multi-tenant department isolation and telemetry calculation tests.
- `HodFacultyServiceTest`: Department-scoped faculty querying, cross-department access rejection (`403`), and status transition audit tests.
- `HodStudentServiceTest`: Department-scoped student querying, foreign program filter rejection (`403`), cross-department access rejection (`403`), and status change audit tests.
- `HodWorkloadServiceTest`: Department-scoped workload telemetry, cross-department workload inspection rejection (`403`), and assignment querying tests.

### 5.2 Frontend Build & TypeScript Validation

- `tsc -b`: Passed with zero TypeScript errors.
- `vite build`: Successfully bundled production assets (`dist/assets/index-*.js`, `dist/assets/index-*.css`).
