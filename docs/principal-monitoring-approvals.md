# Phase 24 — Principal Institution Monitoring & Approvals

## 1. Purpose & Scope

Phase 24 elevates the Principal role from an overview-only dashboard user into an active, institution-level operational monitoring and approval authority for the Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO).

Key operational domains:
1. **Live Institution Monitoring:** Real-time visibility into all departments, students, faculty, academic resources, requests, active allocations, and hostel capacities.
2. **Approval Management:** Review, approve, and reject academic resource requests requiring Principal sign-off within the authorized institution scope.
3. **Resource Request Monitoring:** Institution-wide request telemetry with multi-criteria filtering (department, category, resource, status, priority, dates).
4. **Allocation Monitoring:** Detailed oversight of facility allocations, time windows, and student/faculty assignments.
5. **Approval History & Decision Tracking:** Full chronological audit trail of all workflow stages (HOD -> Principal).

---

## 2. Security Model & Institution Scoping

Authentication and authorization strictly adhere to the zero-trust security paradigm:

```
JWT Token
  ↓
Authenticated Principal User Context (SecurityUtils.getCurrentUserId())
  ↓
ROLE_PRINCIPAL Security Verification (@PreAuthorize("hasRole('PRINCIPAL')"))
  ↓
PrincipalAssignment Repository Lookup
  ↓
Authorized Institution Resolution
  ↓
Institution-Scoped Operations & Database Filtering
```

### Security Invariants:
- **Zero Frontend Trust:** Never accept `principalId`, `institutionId`, `departmentId`, or `approvalId` from client requests as authorization boundaries.
- **Cross-Institution Isolation:** If Principal belongs to Institution A, requests, approvals, departments, allocations, and hostels belonging to Institution B return `403 Forbidden`.
- **Manipulated IDs Blocked:** Passing a `departmentId` belonging to another institution is rejected at the database specification layer.

---

## 3. Frontend Routes & UI Pages

All routes reuse the responsive `PrincipalLayout` shell:

| Route | Page Component | Description |
| :--- | :--- | :--- |
| `/principal/monitoring` | `PrincipalMonitoringPage` | Institution summary cards, department monitoring table, hostel overview table, and recent operational activity feed. |
| `/principal/approvals` | `PrincipalApprovalsPage` | Filterable list of all institution approvals with status tabs, date pickers, and decision actions. |
| `/principal/approvals/:id` | `PrincipalApprovalDetailPage` | Deep-dive request information, chronological approval history timeline, and Principal approve/reject decision cards. |
| `/principal/resource-requests` | `PrincipalResourceRequestsPage` | Full institution resource request monitoring with search, priority filters, and detail drawer. |
| `/principal/allocations` | `PrincipalAllocationsPage` | Facility occupancy monitoring, time windows, allocated faculty/student info, and detail modals. |

---

## 4. Backend APIs & Architecture

All controllers are secured with `@PreAuthorize("hasRole('PRINCIPAL')")`.

### 1. Monitoring Controller (`/api/principal/monitoring`)
- `GET /api/principal/monitoring`: Returns live summary KPIs, department breakdown, hostel capacities, and recent activity.

### 2. Approval Controller (`/api/principal/approvals`)
- `GET /api/principal/approvals`: Paged and filtered approvals across the institution (`departmentId`, `status`, `approvalLevel`, `fromDate`, `toDate`, `page`, `size`, `sort`).
- `GET /api/principal/approvals/{id}`: Detailed approval record with request details, academic context, and approval history.
- `PATCH /api/principal/approvals/{id}/approve`: Approves a pending request/approval with optional notes.
- `PATCH /api/principal/approvals/{id}/reject`: Rejects a pending request/approval with mandatory rejection reason.

### 3. Resource Request Controller (`/api/principal/resource-requests`)
- `GET /api/principal/resource-requests`: Filterable requests with department, category, resource, status, priority, and date range parameters.
- `GET /api/principal/resource-requests/{id}`: Request details with academic subject, section, capacity, and approval history.
- `PATCH /api/principal/resource-requests/{id}/approve`: Direct request approval endpoint.
- `PATCH /api/principal/resource-requests/{id}/reject`: Direct request rejection endpoint with mandatory comments.

### 4. Allocation Controller (`/api/principal/allocations`)
- `GET /api/principal/allocations`: Paged allocations across institution resources and departments.
- `GET /api/principal/allocations/{id}`: Full allocation details including room capacity, location, academic term, and allocated user.

---

## 5. Approval Workflow & State Transitions

### State Transition Rules:
- Only approvals and requests in `PENDING` status are eligible for action.
- Approving an already approved or rejected request returns `409 Conflict`.
- Rejecting an already approved or rejected request returns `409 Conflict`.
- Rejection reason is mandatory (`BadRequestException` if empty or missing).
- State transitions are executed inside atomic `@Transactional` boundaries:
  1. Update `AcademicResourceRequest.status` (`APPROVED` or `REJECTED`).
  2. Update/create `Approval` record with `approvalLevel = PRINCIPAL`, `approvedBy = principalUser`, and comments.
  3. Create `AuditLog` record (`PRINCIPAL_RESOURCE_REQUEST_APPROVED` or `PRINCIPAL_RESOURCE_REQUEST_REJECTED`).

```
[Faculty / Student Request]
         ↓
   Status: PENDING
         ↓
   [HOD Review] ── (if required)
         ↓
[Principal Approval Stage]
    ┌────┴────┐
    ▼         ▼
[Approve]   [Reject] (Reason required)
    │         │
    ▼         ▼
 APPROVED  REJECTED
    │
    ▼ (Phase 22 / Future)
[Resource Allocation]
```

---

## 6. Audit Logging

Principal actions generate immutable audit log entries:
- `PRINCIPAL_RESOURCE_REQUEST_APPROVED`: Logged when the Principal approves an academic resource requisition.
- `PRINCIPAL_RESOURCE_REQUEST_REJECTED`: Logged when the Principal rejects a requisition, recording the rejection reason.
- Never logs sensitive tokens, credentials, or password hashes.

---

## 7. Testing & Verification

### Backend Tests:
- `PrincipalMonitoringSecurityTest`: Tests 200 OK for valid Principal, 401 Unauthorized for unauthenticated requests, and summary KPI verification.
- `PrincipalApprovalSecurityTest`: Tests approval listing, approval detail, cross-institution `403 Forbidden`, approve workflow, `409 Conflict` on already processed approvals, and reject workflow with mandatory reason.
- `PrincipalResourceRequestSecurityTest`: Tests request listing, request detail, cross-institution isolation, and unauthenticated handling.
- `PrincipalAllocationSecurityTest`: Tests allocation listing, detail retrieval, cross-institution `403 Forbidden`, and unauthenticated rejection.
- Regression verification: All 56 HOD tests and 22 Principal tests pass with 0 failures and 0 errors.

### Frontend Verification:
- Production bundle compiled with `tsc -b && vite build`: 0 errors.
- Real database telemetry: Zero mock data, zero placeholder metrics.

---

## 8. Strictly Excluded (Deferred to Future Phases)

❌ Academic resource optimization algorithms (Phase 28+)
❌ Automated conflict resolution and automated assignment engines
❌ Artificial intelligence, machine learning, and predictive models
❌ Warden dashboard, hostel room allocation, and bed assignment (Phase 25)
❌ Hostel maintenance tickets and complaint workflows
