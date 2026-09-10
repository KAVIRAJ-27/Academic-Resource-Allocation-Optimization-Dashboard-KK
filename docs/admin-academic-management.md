# Admin Academic Structure & Curriculum Management

## 1. Overview
The **Academic Structure & Curriculum Management** module (Phase 9 of the Academic & Hostel Resource Allocation Optimization Dashboard - AHRAO) delivers a centralized administrative control plane for defining, structuring, and maintaining the core institutional hierarchy.

This module establishes the foundational master data consumed by subsequent academic modules:
- Classrooms & Laboratories Master (Phase 10)
- Timetable & Scheduling Matrix (Phase 11)
- Faculty Workload Optimization (Phase 12)
- Academic Resource Allocation Engine (Phase 13)

---

## 2. Master Data Hierarchy

```
+-----------------------------------------------------------------------------------+
|                                INSTITUTION PROFILE                                |
+-----------------------------------------+-----------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
        +---------------------+                       +---------------------+
        |     DEPARTMENTS     |                       |   ACADEMIC YEARS    |
        +----------+----------+                       +----------+----------+
                   |                                             |
                   v                                             v
        +---------------------+                       +---------------------+
        |  PROGRAMS / DEGREES |                       |      SEMESTERS      |
        +----------+----------+                       +----------+----------+
                   |                                             |
                   +----------------------+----------------------+
                                          |
                                          +----------------------+
                                          |                      |
                                          v                      v
                               +---------------------+ +---------------------+
                               | CURRICULAR SUBJECTS | |   CLASS SECTIONS    |
                               +---------------------+ +---------------------+
```

### Hierarchy Constraints & Cascade Rules:
1. **Institution**:
   - Single institutional profile root (`Apex Institute of Technology`).
   - Central contact information, accreditation code, and address.
2. **Departments**:
   - Distinct departments (e.g. `CSE`, `ECE`, `MECH`).
   - Links to active Head of Department (HOD) from Staff appointments.
3. **Academic Years**:
   - Institutional term spans (e.g. `2025-2026`, `2026-2027`).
   - **Single Active Year Policy**: Exactly one academic year can hold `ACTIVE` status at any given time. Activating an academic year atomically sets all other years in the institution to `INACTIVE`.
4. **Semesters**:
   - Numbered academic semesters (1 to 12) bound to an Academic Year.
   - Unique constraint: `(academic_year_id, semester_number)`.
5. **Programs / Degrees**:
   - Degree programs (e.g. `B.Tech CSE`, `M.Tech AI`) assigned to a parent department.
   - Distinct program levels: `UG`, `PG`, `DIPLOMA`, `PHD`.
   - Duration in years and total configured semesters.
6. **Curricular Subjects**:
   - Course catalog items bound to a Department, Program, and Semester Number.
   - Attributes: Credits, Course Type (`THEORY`, `PRACTICAL`, `HYBRID`), weekly instructional hours, laboratory equipment prerequisite flag.
7. **Class Sections**:
   - Student cohort groups (e.g. `Section A`, `Section B`) bound to a Department, Program, and Semester Term.
   - Maximum capacity constraint, real-time enrolled student count, and allocation references.

---

## 3. Relational Integrity & Conflict Protection (HTTP 409)

To ensure referential and operational consistency across the institution, physical deletion is strictly guarded:

| Entity | Protected Dependencies | Behavior on Conflict |
| :--- | :--- | :--- |
| **Department** | Programs, Appointed Faculty, Enrolled Students, Academic Rooms | Returns `409 Conflict` with exact reason if any active dependent entities exist |
| **Academic Year** | Semesters, Resource Allocations | Returns `409 Conflict` if dependent semesters or allocations exist |
| **Semester** | Class Sections, Resource Allocations | Returns `409 Conflict` if dependent class sections or allocations exist |
| **Program** | Enrolled Students, Subjects, Class Sections | Returns `409 Conflict` if dependent students, subjects, or sections exist |
| **Subject** | Resource Allocations, Course Registrations | Returns `409 Conflict` if dependent allocations or active enrollments exist |
| **Section** | Enrolled Students, Resource Allocations | Returns `409 Conflict` if student enrollments or room allocations exist |

---

## 4. REST API Endpoints Specification

All academic administrative endpoints are protected with `@PreAuthorize("hasRole('ADMIN')")`.

### 4.1 Institution Profile
- `GET /api/admin/institution`
  - Returns institution profile, contact details, and institutional rollup metrics.
- `PUT /api/admin/institution`
  - Updates institution name, code, contact phone, contact email, website, and campus address.

### 4.2 Department Registry
- `GET /api/admin/departments`
  - Query parameters: `search`, `status` (`ACTIVE`/`INACTIVE`), `page`, `size`, `sortBy`, `sortDir`.
  - Returns paginated `DepartmentSummaryResponse` with programs count, faculty count, students count, and active HOD name.
- `GET /api/admin/departments/{id}`
  - Returns detailed departmental record with full metric breakdown.
- `POST /api/admin/departments`
  - Creates department with unique code and name validation.
- `PUT /api/admin/departments/{id}`
  - Updates department metadata.
- `PATCH /api/admin/departments/{id}/status?status=ACTIVE|INACTIVE`
  - Toggles department status with audit log recording.
- `DELETE /api/admin/departments/{id}`
  - Deletes department if no dependent programs, students, or faculty exist.

### 4.3 Academic Years
- `GET /api/admin/academic-years`
  - Query parameters: `search`, `status`, `page`, `size`, `sortBy`, `sortDir`.
- `GET /api/admin/academic-years/{id}`
  - Returns year details with linked semester count and allocation count.
- `POST /api/admin/academic-years`
  - Creates new academic year with date boundary validation (`endDate > startDate`).
- `PUT /api/admin/academic-years/{id}`
  - Updates year dates and name.
- `PATCH /api/admin/academic-years/{id}/status?status=ACTIVE|INACTIVE`
  - Updates status.
- `POST /api/admin/academic-years/{id}/activate`
  - Atomically activates the target academic year and deactivates all other academic years in the institution.
- `DELETE /api/admin/academic-years/{id}`
  - Deletes academic year if no dependent semesters or allocations exist.

### 4.4 Semesters
- `GET /api/admin/semesters`
  - Query parameters: `search`, `academicYearId`, `status`, `page`, `size`, `sortBy`, `sortDir`.
- `GET /api/admin/semesters/{id}`
  - Returns semester details with section count and allocations count.
- `POST /api/admin/semesters`
  - Creates semester within academic year. Enforces unique `(academicYearId, semesterNumber)`.
- `PUT /api/admin/semesters/{id}`
  - Updates semester dates and number.
- `PATCH /api/admin/semesters/{id}/status?status=ACTIVE|INACTIVE`
  - Updates semester status.
- `DELETE /api/admin/semesters/{id}`
  - Deletes semester if no linked sections or allocations exist.

### 4.5 Programs / Degree Courses
- `GET /api/admin/programs`
  - Query parameters: `search`, `departmentId`, `programType` (`UG`/`PG`/`DIPLOMA`/`PHD`), `status`, `page`, `size`, `sortBy`, `sortDir`.
- `GET /api/admin/programs/{id}`
  - Returns program details with enrolled student count, subject count, and section count.
- `POST /api/admin/programs`
  - Creates program under parent department with unique code validation.
- `PUT /api/admin/programs/{id}`
  - Updates program details.
- `PATCH /api/admin/programs/{id}/status?status=ACTIVE|INACTIVE`
  - Updates program status.
- `DELETE /api/admin/programs/{id}`
  - Deletes program if no dependent students, subjects, or sections exist.

### 4.6 Curricular Subjects
- `GET /api/admin/subjects`
  - Query parameters: `search`, `departmentId`, `programId`, `semesterNumber`, `type` (`THEORY`/`PRACTICAL`/`HYBRID`), `status`, `page`, `size`, `sortBy`, `sortDir`.
- `GET /api/admin/subjects/{id}`
  - Returns subject details with weekly hours, lab requirement, and allocation count.
- `POST /api/admin/subjects`
  - Creates subject under department and program with unique code check.
- `PUT /api/admin/subjects/{id}`
  - Updates subject details.
- `PATCH /api/admin/subjects/{id}/status?status=ACTIVE|INACTIVE`
  - Updates subject status.
- `DELETE /api/admin/subjects/{id}`
  - Deletes subject if no dependent allocations or enrollments exist.

### 4.7 Class Sections
- `GET /api/admin/sections`
  - Query parameters: `search`, `departmentId`, `programId`, `semesterId`, `status`, `page`, `size`, `sortBy`, `sortDir`.
- `GET /api/admin/sections/{id}`
  - Returns section details with capacity, enrolled student count, and allocation count.
- `POST /api/admin/sections`
  - Creates section under program and semester term.
- `PUT /api/admin/sections/{id}`
  - Updates section name, capacity, and semester linkage.
- `PATCH /api/admin/sections/{id}/status?status=ACTIVE|INACTIVE`
  - Updates section status.
- `DELETE /api/admin/sections/{id}`
  - Deletes section if no enrolled students or allocations exist.

### 4.8 Unified Academic Reference Data
- `GET /api/admin/academic/reference-data`
  - Returns active departments, academic years, semesters, programs, program types, and subject types in a single request for fast UI dropdown hydration.

---

## 5. Audit Logging Architecture
All state-modifying actions (create, update, status change, academic year activation, delete) across every academic tier automatically record an immutable `AuditLog` entry:
- `user`: Injected from Spring Security `Authentication.getName()`
- `action`: `CREATE_DEPARTMENT`, `UPDATE_DEPARTMENT`, `CHANGE_DEPARTMENT_STATUS`, `DELETE_DEPARTMENT`, `ACTIVATE_ACADEMIC_YEAR`, `CREATE_PROGRAM`, `CREATE_SUBJECT`, `CREATE_SECTION`, etc.
- `entityType`: `Department`, `AcademicYear`, `Semester`, `Program`, `Subject`, `Section`, `Institution`
- `entityId`: Primary key of modified entity
- `oldValue` / `newValue`: Concise state transitions or metadata JSON
- `ipAddress` & `userAgent`: Extracted from HTTP servlet request headers

---

## 6. Frontend Architecture & User Experience

### 6.1 Unified Administration Hub (`AcademicManagementPage.tsx`)
- Mounted at `/admin/academic` with query-synced tabs:
  `?tab=institution`, `?tab=departments`, `?tab=years`, `?tab=semesters`, `?tab=programs`, `?tab=subjects`, `?tab=sections`.
- Alias route `/admin/departments` automatically mounts `<AcademicManagementPage initialTab="departments" />`.
- KPI metric cards show real-time totals for Departments, Programs, Active Academic Year, Subjects, Sections, and Students.
- Cascading dropdown filters ensure valid selection sets:
  - Department selection dynamically filters the Program dropdown.
  - Program selection dynamically scopes semester and section listings.
- Dedicated Create, Edit, and Relational Details modals with full Bean Validation matching.
- Safe confirmation dialogs for deactivation, activation of academic years, and guarded deletions with graceful error feedback.
