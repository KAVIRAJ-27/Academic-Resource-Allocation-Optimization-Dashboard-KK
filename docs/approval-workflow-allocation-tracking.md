# Phase 32: Approval Workflow & Allocation Tracking

## 1. Executive Summary
Phase 32 implements a centralized, transparent Approval Workflow and Allocation Tracking system for the Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO). It connects resource requests, constraint management (Phase 30), explainable optimization (Phase 31), and transactional allocation engines (Phase 28 & 29) into an auditable lifecycle.

```
Request (Faculty / Student / Warden / HOD)
      ↓
Routing & Scope Determination (HOD / Warden / Principal / Admin)
      ↓
Creation of Approval Record (Status: PENDING)
      ↓
Live Conflict Detection Preview (Phase 30 Simulation)
      ↓
Approver Review & Action (Approve / Reject)
      ↓
[If Approved]
Strict Re-validation under Phase 30 Constraint Engine
      ↓
Direct Invocation of Allocation Engine (Phase 28 Academic / Phase 29 Hostel)
      ↓
Lifecycle Timeline Compilation & Audit Logging
      ↓
Status: ALLOCATED / ACTIVE / COMPLETED / CANCELLED
```

---

## 2. Core Architectural Principles

1. **Zero Blind Allocations**:
   - Approvals never blindly create allocations.
   - Live Phase 30 conflict detection is evaluated on review inspection so approvers see potential collisions before making decisions.
   - **Crucial Transactional Guard**: When an approver clicks "Approve", the approval engine invokes Phase 30 conflict detection *immediately before* invoking the Phase 28 or Phase 29 allocation service. If an intervening allocation booked the resource (stale recommendation), the transaction aborts with `409 Conflict`.

2. **Strict Anti-Self-Approval Enforcement**:
   - Users cannot approve their own requests under any circumstances.
   - If `approver.id == requester.id`, the action is unconditionally blocked with `403 Forbidden` (`You cannot approve your own request`).

3. **Hierarchical Scope Routing & Enforcement**:
   - **Faculty Request** $\rightarrow$ Department **HOD** (strictly within faculty's department).
   - **HOD Request** $\rightarrow$ Institutional **Principal** / Executive Office.
   - **Student Bed Request** $\rightarrow$ Assigned **Warden** (strictly within warden's assigned hostels).
   - **Warden Hostel Request** $\rightarrow$ **Principal** / Institutional Office.
   - **Institution-Wide / Cross-Departmental** $\rightarrow$ **Principal** or **ADMIN**.
   - **ADMIN**: Universal oversight and emergency override with mandatory audit tracking.

4. **Normalized Database Reuse**:
   - Reuses the existing `com.ahrao.entity.approval.Approval` entity and `approvals` table from Phase 2 without redundant tables.
   - Links seamlessly across `resource_requests`, `hostel_allocation_requests`, `allocations`, `hostel_allocations`, and `audit_logs`.

---

## 3. Approver Routing Matrix

| Requester Role | Request Type | Scope Rule | Routed Approver | Approver Scope Validation |
| :--- | :--- | :--- | :--- | :--- |
| **FACULTY** | Academic Resource | Departmental | **HOD** | Approver department ID == Faculty department ID |
| **HOD** | Academic Resource | Cross-Department / Inter-Dept | **PRINCIPAL** | Institution-wide authority |
| **STUDENT** | Hostel Bed | Specific Hostel / Block | **WARDEN** | Approver must be assigned warden for the requested hostel |
| **WARDEN** | Hostel Infrastructure | Hostel-wide / Multi-block | **PRINCIPAL** | Institution-wide authority |
| **ANY** | Escalated / Cross-Scope | Institution | **ADMIN** | Universal institutional governance |

---

## 4. Lifecycle States & Timeline Milestones

The unified timeline compiles chronological milestones across requests, approvals, allocations, and audit logs into an interactive visualization:

```
[1. REQUESTED]
   └── Timestamp, Requester name/role, Department/Hostel, Initial justification
            ↓
[2. PENDING_APPROVAL]
   └── Routed to Approver (HOD / Warden / Principal) based on scope rules
            ↓
[3. UNDER_REVIEW]
   └── Approver inspects details, candidate resource, and live Phase 30 conflict preview
            ↓
     ┌─────────────────────────────┴─────────────────────────────┐
     ▼                                                           ▼
[4a. APPROVED]                                              [4b. REJECTED]
├── Approver ID, Remarks                                    ├── Approver ID, Mandatory reason
├── Phase 30 Transactional Re-check Passed                  └── Status updated to REJECTED
├── Allocation Engine Triggered                             └── Audit log entry created
            ↓
[5. ALLOCATED]
├── Formal Allocation ID generated (Phase 28 / Phase 29)
├── Timetable / Bed status locked to OCCUPIED
            ↓
[6. ACTIVE]
├── Active utilization during academic term / hostel semester
            ↓
[7. COMPLETED / CANCELLED]
├── Allocation released or cancelled (with reason & audit log)
```

---

## 5. Live Conflict Detection & Stale Recommendation Handling

### Live Conflict Detection Preview
When an approver opens an approval item for review:
1. `ApprovalService.getApprovalById(id)` looks up the candidate resource and requested time slot / bed.
2. It executes Phase 30 `ConflictDetectionService.checkAcademicConflicts()` or `checkHostelConflicts()` in read-only preview mode.
3. The response details whether the resource is still free (`conflictStatus: "SAFE"`), or whether an overlap has occurred (`conflictStatus: "CONFLICT_DETECTED"`).
4. The frontend displays a prominent real-time banner:
   - 🟢 **Safe to Allocate**: No scheduling collisions, capacity issues, or maintenance blocks detected.
   - 🔴 **Conflict Detected**: Overlapping reservation or status change identified, warning the approver.

### Atomic Re-Validation Upon Approval
1. Approver submits `POST /api/approvals/{id}/approve` with comments.
2. Service validates that approver is not self-approving.
3. Service checks that approver role and scope match the request target.
4. Service runs Phase 30 conflict detection under transactional boundary.
5. If conflicts exist:
   - Transaction aborts immediately.
   - Returns HTTP `409 Conflict` with error message explaining the specific conflict.
   - Approval state remains `PENDING` (or marked `CONFLICTED`).
6. If conflict check passes:
   - Invokes Phase 28 `academicAllocationService.allocateResource()` or Phase 29 `hostelResourceAllocationService.allocate()`.
   - Updates approval status to `APPROVED`.
   - Records audit log entry and notifies requester.

---

## 6. REST API Endpoints

### 1. Approvals API (`/api/approvals`)
- `GET /api/approvals`: Paged listing of approvals with optional filters (`status`, `requestType`, `startDate`, `endDate`).
- `GET /api/approvals/pending`: Quick filter for pending approvals requiring the caller's action.
- `GET /api/approvals/{id}`: Detailed approval information with candidate details and real-time Phase 30 conflict analysis.
- `POST /api/approvals/{id}/approve`: Execute approval with comments and atomic allocation dispatch.
- `POST /api/approvals/{id}/reject`: Reject request with mandatory rejection remarks.
- `GET /api/approvals/{id}/timeline`: Retrieve full chronological lifecycle history for the approval.

### 2. Allocation Timeline Endpoints
- `GET /api/academic/allocations/{id}/timeline`: Retrieve chronological lifecycle milestones for an academic allocation.
- `GET /api/hostel/resource-allocations/{id}/timeline`: Retrieve chronological lifecycle milestones for a hostel bed allocation.

---

## 7. Frontend User Interface

### Approval Center Dashboard (`/approvals`)
- **Metric Cards**:
  - `Pending Approvals`: Real-time badge counter of items awaiting review.
  - `Approved Requests`: Total successfully approved and allocated items.
  - `Rejected Requests`: Requests rejected with audit reasons.
  - `Avg Resolution Time`: Operational turnaround metric.
- **Tabs**:
  - `Pending Review`: Direct queue of action items filtered for the current user's scope.
  - `All Approvals`: Historical search with dropdowns for status and request domain.
- **Approval Action Modal**:
  - Full request metadata (Requester, Dept/Hostel, Time/Dates, Purpose).
  - Target candidate resource information (Capacity, Location, Category).
  - **Live Phase 30 Conflict Status Banner** (Dynamic Green/Red indicator).
  - Review comments input with validation.
  - Dedicated "Approve Allocation" and "Reject Request" actions.
- **Visual Timeline Modal**:
  - Vertical milestone layout with timestamp, actor, status pill, and remarks.

---

## 8. Security & RBAC Matrix

| Endpoint | Permitted Roles | Security / Scope Check |
| :--- | :--- | :--- |
| `GET /api/approvals` | ADMIN, PRINCIPAL, HOD, WARDEN | Scoped to approver authority |
| `GET /api/approvals/pending` | ADMIN, PRINCIPAL, HOD, WARDEN | Filtered by pending items in user scope |
| `GET /api/approvals/{id}` | ADMIN, PRINCIPAL, HOD, WARDEN, Requester | Permitted for stakeholders & approvers |
| `POST /api/approvals/{id}/approve` | ADMIN, PRINCIPAL, HOD, WARDEN | Anti-self-approval + Scope check + Phase 30 re-validation |
| `POST /api/approvals/{id}/reject` | ADMIN, PRINCIPAL, HOD, WARDEN | Anti-self-approval + Scope check + Mandatory remarks |
| `GET /api/approvals/{id}/timeline` | ALL AUTHENTICATED ROLES | Stakeholders & oversight roles |

---

## 9. Verification & Test Suite
- `ApprovalRoutingServiceTest`: Verifies routing rules, scope barriers, and anti-self-approval rejection.
- `ApprovalServiceTest`: Verifies atomic approval flow, conflict aborts, Phase 28/29 dispatch, and rejection handling.
- `ApprovalSecurityTest`: Validates 401 Unauthorized, 403 Forbidden for unauthorized roles, and anti-self-approval blocking.
- `PrincipalApprovalSecurityTest`: Verifies executive approval scopes and multi-level escalation.
- Frontend test and TypeScript compilation: Verified clean with zero errors via `tsc -b && vite build`.
