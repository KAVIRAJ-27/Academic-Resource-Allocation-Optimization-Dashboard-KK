# Faculty Workload & Resource Requests Module (Phase 19)

PROJECT: Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)

## 1. Overview

The **Faculty Workload & Resource Requests Module** provides a role-scoped, auditable interface for authenticated faculty members (`ROLE_FACULTY`). It delivers:

1. **Teaching Workload Telemetry** (`/faculty/workload`):
   - Current workload summary cards (Total hours, teaching hours, lab hours, other duties, balance status, subject & section counts, weekly limits).
   - Subject-wise weekly instruction load visualization using Recharts.
   - Detailed assigned teaching breakdown by course, subject, section, and weekly contact hours.
   - Historical evaluation records across previous academic years and semesters.
2. **Academic Resource Requisitions** (`/faculty/resource-requests`):
   - Requisition lifecycle management (viewing, submitting, tracking, and cancelling).
   - Status filtering (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED`) and real-time summary counter cards.
   - Server-side search and pagination.
   - Creation of academic resource requests (`/faculty/resource-requests/new`) with active resource eligibility validation, non-past date enforcement, start/end time validation, optional assigned subject linkage, and duplicate pending request prevention.
   - Detailed request inspection (`/faculty/resource-requests/:id`) with strict backend ownership verification.
   - One-click request cancellation for `PENDING` requisitions with confirmation dialogs and comprehensive audit logging.

---

## 2. Security & Ownership Architecture

### A. Zero-Trust Identity Resolution

In adherence to strict project security guidelines, faculty endpoints **never** accept or trust a `facultyId` or `userId` from the frontend client. Identity is derived strictly from Spring Security's authenticated JWT principal:

```text
JWT Authenticated Principal
             ↓
  SecurityUtils.getCurrentUserId()
             ↓
       User Entity
             ↓
     Faculty Entity (via facultyRepository.findByUserId(userId))
```

### B. Ownership Enforcement & Isolation

- A faculty member can only query and view their own workload summary and breakdown records (`GET /api/faculty/workload`).
- Requisition listing (`GET /api/faculty/resource-requests`) applies a mandatory database specification filter: `requester.id = :userId`.
- Requisition inspection (`GET /api/faculty/resource-requests/{id}`) verifies `request.getRequester().getId().equals(userId)`. Non-owners receive an immediate `403 Forbidden` response.
- Cancellation (`PATCH /api/faculty/resource-requests/{id}/cancel`) restricts cancellation strictly to the owning faculty member and only when the request status is `PENDING`. Non-pending cancellations return `400 Bad Request`.
- If an academic context (subject/section) is supplied during request creation, the backend validates that the faculty is legitimately assigned to that subject via `FacultySubjectAssignmentRepository.existsByFacultyIdAndSubjectId(faculty.getId(), subjectId)`. Unauthorized subject IDs trigger a `403 Forbidden` response.

---

## 3. Database Schema Reuse

Phase 19 reuses existing schema entities without schema alterations or destructive DDL:

- `FacultyWorkload`: Tracks `faculty`, `academicYear`, `semester`, `totalHours`, `teachingHours`, `labHours`, `otherHours`, `workloadStatus`, `calculatedAt`.
- `FacultySubjectAssignment`: Links `faculty`, `subject`, `section`, `academicYear`, `semester`, `hoursPerWeek`, `status`.
- `AcademicResourceRequest`: Tracks `requester`, `requestedResource`, `category`, `department`, `purpose`, `requestedDate`, `startTime`, `endTime`, `quantity`, `priority`, `status`, `description`.
- `Resource`: Contains `name`, `code`, `capacity`, `location`, `status`, `category`, `department`.
- `ResourceCategory`: Categorizes resources (Classrooms, Laboratories, Equipment, Auditoriums).
- `AuditLog`: Captures `user`, `action` (`FACULTY_RESOURCE_REQUEST_CREATED`, `FACULTY_RESOURCE_REQUEST_CANCELLED`), `entityType`, `entityId`, `oldValue`, `newValue`, `ipAddress`, `userAgent`, `createdAt`.

---

## 4. Backend API Specifications

### Workload Endpoints

- `GET /api/faculty/workload`
  - **Security**: Authenticated `ROLE_FACULTY`.
  - **Behavior**: Retrieves current workload metrics, breakdown across active teaching assignments, and historical records for the authenticated faculty.
  - **Response**: `ApiResponse<FacultyWorkloadResponseDto>`

### Resource Request Endpoints

- `GET /api/faculty/resource-requests`
  - **Security**: Authenticated `ROLE_FACULTY`.
  - **Query Parameters**: `status`, `categoryId`, `date`, `search`, `page`, `size`, `sortBy`, `sortDirection`.
  - **Behavior**: Paginated search and filtering of requests owned by the authenticated faculty.
  - **Response**: `ApiResponse<PagedResponse<FacultyResourceRequestDto>>`

- `GET /api/faculty/resource-requests/summary`
  - **Security**: Authenticated `ROLE_FACULTY`.
  - **Behavior**: Aggregates counts of requests by lifecycle status for the authenticated faculty.
  - **Response**: `ApiResponse<FacultyResourceRequestSummaryCountsDto>`

- `GET /api/faculty/resource-requests/resources`
  - **Security**: Authenticated `ROLE_FACULTY`.
  - **Query Parameters**: `categoryId` (optional).
  - **Behavior**: Lists active facilities and equipment eligible for faculty reservation requests.
  - **Response**: `ApiResponse<List<FacultyAvailableResourceDto>>`

- `GET /api/faculty/resource-requests/{id}`
  - **Security**: Authenticated `ROLE_FACULTY`. Ownership verified.
  - **Behavior**: Returns detailed request information including facility specs, requested time window, and requester details.
  - **Response**: `ApiResponse<FacultyResourceRequestDetailsDto>`

- `POST /api/faculty/resource-requests`
  - **Security**: Authenticated `ROLE_FACULTY`.
  - **Request Body**: `CreateFacultyResourceRequest` (`resourceId`, `purpose`, `requestedDate`, `startTime`, `endTime`, `quantity`, `priority`, `description`, `subjectId`, `sectionId`).
  - **Validation**: Active faculty check, active resource check, non-past date, start < end time, assigned subject validation, duplicate pending request check.
  - **Audit**: Emits `FACULTY_RESOURCE_REQUEST_CREATED`.
  - **Response**: `201 Created` with `ApiResponse<FacultyResourceRequestDto>`

- `PATCH /api/faculty/resource-requests/{id}/cancel`
  - **Security**: Authenticated `ROLE_FACULTY`. Ownership verified.
  - **Validation**: Only `PENDING` requests are eligible for cancellation.
  - **Audit**: Emits `FACULTY_RESOURCE_REQUEST_CANCELLED`.
  - **Response**: `200 OK` with `ApiResponse<FacultyResourceRequestDto>`

---

## 5. Audit Logging Events

All requisition lifecycle events are automatically persisted to the centralized `audit_logs` table:

- `FACULTY_RESOURCE_REQUEST_CREATED`: Records the request ID, resource name, scheduled date, time window, client IP, and user-agent.
- `FACULTY_RESOURCE_REQUEST_CANCELLED`: Records the state transition from `PENDING` to `CANCELLED` with audit metadata.

---

## 6. Frontend Architecture & Routing

### Routes

| Route | Component | Description |
| --- | --- | --- |
| `/faculty/workload` | `FacultyWorkloadPage` | Workload summaries, Recharts distribution, assigned breakdown, and history |
| `/faculty/resource-requests` | `FacultyResourceRequestsPage` | Requisition ledger with summary counts, status filters, and cancellation |
| `/faculty/resource-requests/new` | `CreateFacultyResourceRequestPage` | Multi-section form with resource and subject selector |
| `/faculty/resource-requests/:id` | `FacultyResourceRequestDetailsPage` | Comprehensive request audit view with cancellation trigger |
| `/faculty/requests` | Redirect | Backward-compatible alias redirecting to `/faculty/resource-requests` |

### Design System Adherence

- Base Canvas: `#080A0F`
- Card Surfaces: `#11141C` with `#1E2330` borders and subtle box-shadows.
- Accents: Emerald/Teal primary actions, Purple curriculum indicators, Amber warnings, Rose cancellations.
- Empty states and skeleton loaders across all views prevent flickering and provide meaningful user guidance.
- Mobile responsiveness tested across 320px, 768px, 1024px, and 1440px viewport widths with responsive card fallbacks for tabular data.
