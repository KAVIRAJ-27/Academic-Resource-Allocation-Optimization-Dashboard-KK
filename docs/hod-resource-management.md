# HOD Academic Resource Requests & Allocation Management (Phase 22)

## 1. Overview & Objective

Phase 22 implements the Head of Department (HOD) Academic Resource Requests and Allocation module for the **Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)**.

This module provides department-level oversight and management for:
1. **Academic Resource Requests** (`/hod/resource-requests`, `/hod/resource-requests/:id`):
   - Review all academic resource booking requests originating from faculty and students in the HOD's department.
   - Filter by status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`), priority level (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), category, resource, and date range.
   - Inspect full request details including requester identity, resource specifications, academic context (subject, section), purpose, schedule, approval history, and associated allocation.
   - Execute authorized HOD approvals (with optional remarks) and rejections (with mandatory reason), creating persistent `Approval` records (`ApprovalLevel.HOD`) and audit events (`HOD_RESOURCE_REQUEST_APPROVED`, `HOD_RESOURCE_REQUEST_REJECTED`).
2. **Academic Resource Allocations** (`/hod/allocations`, `/hod/allocations/:id`):
   - Strictly **read-only** monitoring of departmental resource assignments.
   - View active, upcoming, and completed allocations for classrooms, laboratories, computing centres, and seminar halls.
   - Filter by resource, beneficiary, status, and date range.
   - Inspect full allocation specifications, time slot bounds, academic year/semester, and origin request details.
3. **Department Resource KPIs**:
   - Real-time request counts (`pendingCount`, `approvedCount`, `rejectedCount`, `cancelledCount`, `totalRequestsCount`).
   - Resource inventory availability breakdown (`totalResources`, `availableResources`, `allocatedResources`, `maintenanceResources`, `inactiveResources`).
   - Allocation status metrics (`totalAllocations`, `activeAllocations`, `pendingAllocations`, `completedAllocations`).

---

## 2. Security & Department Isolation Model

Strict zero-trust security is enforced at every layer:

1. **Authentication & Authorization**:
   - All endpoints are protected with `@PreAuthorize("hasRole('HOD')")`.
   - The HOD's identity and authorized department are derived exclusively from the authenticated JWT token:
     `SecurityUtils.getCurrentUserId() -> HodDepartmentResolver.resolveHodDepartment(userId)`.
   - Never accept client-supplied `departmentId` or `hodId` parameters.
2. **Cross-Department Protection**:
   - Attempting to view, approve, or reject a request belonging to another department immediately aborts with `403 Forbidden` (`Access denied: Resource request belongs to another department`).
   - Attempting to view an allocation belonging to another department immediately aborts with `403 Forbidden` (`Access denied: Resource allocation belongs to another department`).
   - Security alerts are logged with the authenticated user ID and entity ID.
3. **State Integrity**:
   - Only requests in `PENDING` status may be approved or rejected. Attempting to approve/reject an already approved, rejected, or cancelled request throws `409 Conflict`.
   - Rejection requires a non-blank reason string; omitting it throws `400 Bad Request`.
4. **Scope Boundaries**:
   - HOD has no permission to create or alter institutional allocations directly (allocations are read-only monitoring for HOD).
   - No cross-institution administrative access.

---

## 3. Backend Endpoints

### Academic Resource Requests (`/api/hod/resource-requests`)

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/hod/resource-requests` | Paginated, searchable, filterable list of department requests | `200 OK`, `401 Unauthorized`, `403 Forbidden` |
| `GET` | `/api/hod/resource-requests/summary` | Real-time KPI counts and department resource breakdown | `200 OK`, `401 Unauthorized`, `403 Forbidden` |
| `GET` | `/api/hod/resource-requests/{id}` | Detailed request inspection (requester, resource, schedule, approval history, allocation) | `200 OK`, `403 Forbidden`, `404 Not Found` |
| `PATCH` | `/api/hod/resource-requests/{id}/approve` | Approve a PENDING request with optional comments | `200 OK`, `400 Bad Request`, `403 Forbidden`, `409 Conflict` |
| `PATCH` | `/api/hod/resource-requests/{id}/reject` | Reject a PENDING request with mandatory reason | `200 OK`, `400 Bad Request`, `403 Forbidden`, `409 Conflict` |

### Academic Resource Allocations (`/api/hod/allocations`)

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/hod/allocations` | Paginated list of department resource allocations (read-only) | `200 OK`, `401 Unauthorized`, `403 Forbidden` |
| `GET` | `/api/hod/allocations/summary` | Real-time allocation summary metrics (`total`, `active`, `pending`, `completed`) | `200 OK`, `401 Unauthorized`, `403 Forbidden` |
| `GET` | `/api/hod/allocations/{id}` | Detailed inspection of department resource allocation | `200 OK`, `403 Forbidden`, `404 Not Found` |

---

## 4. Frontend Architecture

### Custom Hooks
- `useHodResourceRequests(initialPageSize = 10)`:
  - Manages requests state, KPI data, search debouncing, multi-criteria filtering (`status`, `priority`, `fromDate`, `toDate`), server-side pagination, request detail drawer/modal state, and approve/reject actions with auto-refresh.
- `useHodAllocations(initialPageSize = 10)`:
  - Manages allocations state, KPI data, status/resource/date filtering, server-side pagination, and allocation detail modal state.

### UI Components
- `HodRequestSummaryCards`: KPI cards for Pending, Approved, Rejected, Total requests, plus department resource inventory status (Available, Allocated, Maintenance).
- `HodRequestTable`: Filterable, searchable table with status/priority badges, schedule details, requester badges, and quick actions (view, approve, reject).
- `HodRequestDetailModal`: Full multi-section inspection modal displaying Requester Info, Resource Specs, Academic Context, Schedule, Approval History timeline, and Related Allocation.
- `HodApproveRequestModal`: Clean confirmation modal with optional approval remarks.
- `HodRejectRequestModal`: Rejection dialog with mandatory reason textarea and validation.
- `HodAllocationSummaryCards`: KPI cards for Total, Active, Pending, and Completed allocations.
- `HodAllocationTable`: Clean read-only monitoring table with date/time formatting, academic term badges, and inspection trigger.
- `HodAllocationDetailModal`: Read-only allocation details modal with resource, beneficiary, time slot, and originating request context.

### Pages & Routing
- `/hod/resource-requests`: `HODResourceRequestsPage` mounted in `AppRoutes.tsx` under `HODLayout`.
- `/hod/allocations`: `HODAllocationsPage` mounted in `AppRoutes.tsx` under `HODLayout`.
- Added to HOD navigation sidebar in `navigation.ts` under the Academic category.

---

## 5. Verification & Testing

- **Backend Unit & Security Tests**:
  - `HodResourceRequestSecurityTest`: 6 tests covering authenticated access, unauthenticated rejection, KPI fetching, detail retrieval, approval, and rejection.
  - `HodResourceAllocationSecurityTest`: 4 tests covering authenticated access, unauthenticated rejection, KPI fetching, and detail retrieval.
  - `HodResourceRequestServiceTest`: 8 tests covering department scoping, cross-department 403 prevention, pending state enforcement, approval workflow, rejection validation, and genuine database KPI computation.
  - `HodResourceAllocationServiceTest`: 3 tests covering allocation inspection, cross-department 403 prevention, and genuine database KPI computation.
  - **All 56 HOD-related tests pass with 0 failures and 0 errors**.
- **Frontend Verification**:
  - Full production build: `npm run build` completed successfully (`tsc -b && vite build`) with zero TypeScript errors and bundle generated in 17.08s.
