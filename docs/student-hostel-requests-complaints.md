# Phase 16: Student Hostel Requests & Complaints Module

### Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)

---

## 1. Executive Summary

Phase 16 delivers the **Student Hostel Requests & Complaints Module** within the AHRAO portal. This module equips enrolled residential students with self-service capabilities to:

- Review and lodge residential accommodation requests (room change, facility requirements, special requests).
- Review and register maintenance/service complaints (electrical, plumbing, room furniture, cleanliness, Wi-Fi connectivity, security).
- Track real-time status progressions across both domains.
- Cancel eligible pending requests (`PENDING` $\rightarrow$ `CANCELLED`).
- View comprehensive hostel and room lineage alongside grievance records.

All operations enforce **zero-trust ownership validation** derived purely from JWT authentication tokens, preventing any privilege escalation or horizontal data leakage.

---

## 2. Architecture & Data Flow

```text
[Authenticated Student Browser]
          │
          │ Bearer JWT (ROLE_STUDENT)
          ▼
[StudentHostelRequestController / StudentHostelComplaintController]
          │
          │ SecurityUtils.getCurrentUserId()
          ▼
[StudentHostelRequestService / StudentHostelComplaintService]
    ├── Verify Student Entity (by user_id)
    ├── Validate Active Hostel Allocation (AllocationStatus.ACTIVE)
    ├── Enforce Ownership (ForbiddenException 403 on mismatch)
    ├── Validate Business State (PENDING only for cancellation)
    └── Write AuditLog (AuditLogRepository)
          │
          ▼
[HostelRequestRepository / HostelComplaintRepository]
          │
          ▼
[PostgreSQL Database: hostel_requests & hostel_complaints]
```

---

## 3. Scope & Boundaries

### Included (Strict Phase 16 Scope)

- Student-scoped querying of personal hostel requests and complaints.
- Paginated requests list with status, type/category, and search filters.
- Real aggregation summary counts (`total`, `pending`/`open`, `approved`/`inProgress`, `rejected`, `cancelled`/`closed`, `completed`/`resolved`).
- Submission of hostel requests (`status = PENDING`).
- Submission of hostel complaints (`status = OPEN`).
- Request cancellation (`status: PENDING -> CANCELLED`).
- Automated student hostel/room context mapping from active allocations.
- Audit logging of all request/complaint creations and cancellations.

### Strictly Excluded (Deferred to Later Phases)

- Hostel allocation optimization algorithm.
- Bed assignment/reassignment engines.
- AI complaint classification or chatbot assistance.
- Warden management dashboards and administrative resolutions.
- Predictive maintenance analytics.

---

## 4. API Endpoints

### 4.1 Student Hostel Requests (`/api/student/hostel/requests`)

| Method | Endpoint | Description | Auth & Roles |
| --- | --- | --- | --- |
| `GET` | `/api/student/hostel/requests` | Paginated listing of student's hostel requests | `ROLE_STUDENT` |
| `GET` | `/api/student/hostel/requests/summary` | Live summary counts across all request statuses | `ROLE_STUDENT` |
| `GET` | `/api/student/hostel/requests/{id}` | Detailed view of specific hostel request with ownership check | `ROLE_STUDENT` |
| `POST` | `/api/student/hostel/requests` | Create new request (validated against active allocation) | `ROLE_STUDENT` |
| `PATCH` | `/api/student/hostel/requests/{id}/cancel` | Cancel an eligible `PENDING` request | `ROLE_STUDENT` |

#### Request Creation Payload

```json
{
  "requestType": "ROOM_CHANGE",
  "description": "Requesting room reassignment due to quiet study floor preferences.",
  "priority": "HIGH"
}
```

### 4.2 Student Hostel Complaints (`/api/student/hostel/complaints`)

| Method | Endpoint | Description | Auth & Roles |
| --- | --- | --- | --- |
| `GET` | `/api/student/hostel/complaints` | Paginated listing of student's hostel complaints | `ROLE_STUDENT` |
| `GET` | `/api/student/hostel/complaints/summary` | Live summary counts across all complaint statuses | `ROLE_STUDENT` |
| `GET` | `/api/student/hostel/complaints/{id}` | Detailed view of specific complaint with ownership check | `ROLE_STUDENT` |
| `POST` | `/api/student/hostel/complaints` | Lodge new hostel complaint with automated room mapping | `ROLE_STUDENT` |

#### Complaint Creation Payload

```json
{
  "category": "ELECTRICAL",
  "title": "Ceiling fan speed regulator broken",
  "description": "The regulator switch is unresponsive and fan stays off continuously.",
  "priority": "MEDIUM"
}
```

---

## 5. Security & Ownership Enforcement

1. **Authenticated Context Resolution**: The backend never accepts `studentId` or `userId` from request parameters or bodies. User identity is extracted exclusively via `SecurityUtils.getCurrentUserId()`.
2. **Horizontal Access Protection**: If student A attempts to query or cancel a request/complaint owned by student B, a `403 ForbiddenException` is thrown immediately.
3. **Active Allocation Guard**: A student must be an active hostel resident (`AllocationStatus.ACTIVE`) to submit hostel requests or lodge complaints. Students without active allocations receive a clear `400 Bad Request` explaining resident requirements.
4. **State Machine Integrity**: Students can only cancel requests with status `PENDING`. Requests already `APPROVED`, `REJECTED`, `COMPLETED`, or `CANCELLED` cannot be modified by students.

---

## 6. Audit Logging Events

| Event Action | Trigger | Entity Type | Details Recorded |
| --- | --- | --- | --- |
| `STUDENT_HOSTEL_REQUEST_CREATED` | Student creates hostel request | `HOSTEL_REQUEST` | Request ID, Type, Priority, Hostel ID |
| `STUDENT_HOSTEL_REQUEST_CANCELLED` | Student cancels pending request | `HOSTEL_REQUEST` | Request ID, Cancelled status |
| `STUDENT_HOSTEL_COMPLAINT_CREATED` | Student lodges hostel complaint | `HOSTEL_COMPLAINT` | Complaint ID, Category, Priority, Hostel ID, Room ID |

---

## 7. Frontend Modules & Navigation

- **Navigation**:
  - `HostelNavTabs`: Shared sub-navigation tabs allowing seamless transitions between:
    - 🏢 Hostel Overview (`/student/hostel`)
    - 📝 Hostel Requests (`/student/hostel/requests` and `/student/hostel-requests`)
    - ⚠️ Complaints & Maintenance (`/student/hostel/complaints` and `/student/complaints`)
- **Pages**:
  - `StudentHostelRequestsPage.tsx`: Summary cards, filters, responsive table, create modal, details modal with cancellation.
  - `StudentHostelComplaintsPage.tsx`: Summary cards, category/status filters, responsive table, report complaint modal, details modal.
- **Custom Hooks**:
  - `useStudentHostelRequests`: Handles pagination, status filtering, live summary counts, caching, details loading, and create/cancel mutations.
  - `useStudentHostelComplaints`: Handles pagination, category filtering, live summary counts, caching, details loading, and create mutation.
