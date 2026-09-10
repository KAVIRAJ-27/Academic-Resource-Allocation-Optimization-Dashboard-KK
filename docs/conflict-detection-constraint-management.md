# Phase 30 — Conflict Detection & Constraint Management

## 1. Overview & Architecture

The **Conflict Detection & Constraint Management Framework** provides an enterprise-grade, deterministic, server-side validation layer for both **Academic Resource Allocation** and **Hostel Resource Allocation**. It dynamically evaluates physical, temporal, structural, and security constraints before any booking is committed to the database.

### Architectural Flow

```
Allocation Request (Preview or Commit)
                  ↓
       Pre-Constraint Validation
                  ↓
     Conflict Detection Service
       ├── AcademicConflictValidator
       └── HostelConflictValidator
                  ↓
          Conflict Result
       ├── Valid: true/false
       └── Conflicts: [ ConflictItem... ]
                  ↓
         Decision Matrix
       ├── ERROR: Reject Allocation (HTTP 409 Conflict)
       ├── WARNING: Allowed only if business rules permit
       └── INFO: Informational telemetry only
                  ↓
   Allocation Commit / Blocked Response
```

---

## 2. Shared Conflict Representation

All conflict diagnostics follow a standardized, reusable structure across backend services, REST APIs, and the React frontend.

### ConflictResultDto / ConflictItemDto Schema

```json
{
  "valid": false,
  "conflicts": [
    {
      "conflictType": "RESOURCE_DOUBLE_BOOKED",
      "severity": "ERROR",
      "domain": "ACADEMIC",
      "entityType": "AcademicResource",
      "entityId": 201,
      "message": "Resource 'CS-Lab-1' is already allocated during the requested time window (10:00 - 11:00).",
      "details": "Overlapping active resource allocation"
    }
  ]
}
```

### Severity Spectrum

| Severity | Allocation Impact | UI Presentation | Business Rule |
| :--- | :--- | :--- | :--- |
| **ERROR** | **BLOCKING** | Red alert banner, Allocate button strictly disabled | Allocation is completely rejected. Returns `HTTP 409 Conflict`. |
| **WARNING** | Non-blocking | Amber badge & warning card | Allocation may proceed if explicit user or policy permits. |
| **INFO** | Informational | Sky blue badge & notice | Diagnostic guidance with zero allocation impedance. |

---

## 3. Academic Constraints & Conflict Types

Implemented in `AcademicConflictValidator.java`:

| Constraint | Conflict Type | Severity | Description |
| :--- | :--- | :--- | :--- |
| **Double Booking** | `RESOURCE_DOUBLE_BOOKED` | `ERROR` | Detects overlapping active allocations on the same physical resource using `startDatetime < existingEnd AND endDatetime > existingStart`. |
| **Timetable Clash** | `RESOURCE_DOUBLE_BOOKED` | `ERROR` | Checks if a recurring weekly academic class is scheduled in the classroom/lab during the requested time slot. |
| **Faculty Overlap** | `FACULTY_TIME_CONFLICT` | `ERROR` | Prevents allocating faculty to a session if they already have an active allocation or a scheduled lecture/lab in their academic timetable. |
| **Section Overlap** | `SECTION_TIME_CONFLICT` | `ERROR` | Verifies that the designated student section does not have an overlapping class scheduled in the institutional timetable. |
| **Capacity Exceeded** | `CAPACITY_EXCEEDED` | `ERROR` | Checks requested student seats against actual physical room capacity (`requestedCapacity > resource.capacity`). |
| **Resource Status** | `RESOURCE_UNAVAILABLE` | `ERROR` | Blocks allocation if the resource is in `MAINTENANCE`, `INACTIVE`, or `RESERVED` status. |
| **Invalid Resource** | `INVALID_RESOURCE` | `ERROR` | Flags non-existent resource IDs. |
| **Invalid Time Slot** | `INVALID_TIME_SLOT` | `ERROR` | Rejects inverted or zero-length time intervals (`startTime >= endTime`). |
| **Department Scope** | `RESOURCE_SCOPE_VIOLATION` | `ERROR` | Ensures HOD/Faculty only allocate resources within their authorized departmental boundaries. |

---

## 4. Hostel Constraints & Conflict Types

Implemented in `HostelConflictValidator.java`:

| Constraint | Conflict Type | Severity | Description |
| :--- | :--- | :--- | :--- |
| **Student Duplicate** | `STUDENT_ALREADY_ALLOCATED` | `ERROR` | Enforces that a student can never possess more than one `ACTIVE` hostel allocation simultaneously. |
| **Bed Duplicate** | `BED_ALREADY_ALLOCATED` | `ERROR` | Verifies the bed does not have an existing active resident allocation. |
| **Bed Availability** | `BED_UNAVAILABLE` | `ERROR` | Rejects beds marked `OCCUPIED`, `MAINTENANCE`, `RESERVED`, or `INACTIVE`. Only `AVAILABLE` beds are eligible. |
| **Room Capacity** | `ROOM_CAPACITY_EXCEEDED` | `ERROR` | Checks count of active resident allocations against room capacity (`activeCount >= room.capacity`). |
| **Hostel Capacity** | `HOSTEL_CAPACITY_EXCEEDED` | `ERROR` | Checks overall active resident headcount against total building capacity (`activeHostelCount >= hostel.capacity`). |
| **Hostel Hierarchy** | `INVALID_HOSTEL_HIERARCHY` | `ERROR` | Validates relational hierarchy: `Bed → Room → Floor → Block → Hostel`. Rejects tampered IDs. |
| **Inactive Entities** | `HOSTEL_INACTIVE` / `ROOM_INACTIVE` / `BED_INACTIVE` | `ERROR` | Rejects allocations for disabled or decommissioned hostels, blocks, rooms, or beds. |
| **Warden Scope** | `WARDEN_SCOPE_VIOLATION` | `ERROR` | Restricts wardens to their assigned hostels using `WardenScopeService.getAuthorizedHostelIds()`. |
| **Request Validity** | `HOSTEL_REQUEST_INVALID` | `ERROR` | Validates that the underlying hostel request exists and is in an approvable/allocatable state (`APPROVED`/`PENDING`). |

---

## 5. Preview & Transactional Concurrency Safety

### 1. Preview Integration (Zero Mutation)
- Preview endpoints:
  - `POST /api/academic/resource-allocations/preview`
  - `POST /api/hostel/resource-allocations/preview`
- Preview execution runs the entire constraint and conflict matrix without:
  - Inserting any allocation records
  - Mutating bed status or resource status
  - Writing audit logs
  - Changing request state

### 2. Double-Check Under Lock (Concurrency Recheck)
Between the moment an administrator or warden previews an allocation and the moment they click **Allocate**, another concurrent process or user might book the same resource or bed.

To prevent race conditions:
1. The final allocation service acquires a database lock on the target entity (`Pessimistic Write Lock` on `HostelBed` / `Resource`).
2. Inside the `@Transactional` boundary, the `ConflictDetectionService` re-evaluates all constraints against the locked entity state.
3. If any `ERROR` level conflict is detected, the transaction rolls back immediately and throws a `ConflictException` with the structured list of conflicts.

---

## 6. HTTP 409 Conflict Response

When an allocation attempt is rejected by the server, the global exception handler maps `ConflictException` directly to `HTTP 409 Conflict`:

```json
{
  "timestamp": "2026-09-09T10:35:00.000Z",
  "status": 409,
  "error": "Conflict",
  "message": "Allocation cannot be completed because conflicts were detected.",
  "path": "/api/hostel/resource-allocations/manual",
  "conflicts": [
    {
      "conflictType": "BED_ALREADY_ALLOCATED",
      "domain": "HOSTEL",
      "severity": "ERROR",
      "entityType": "HostelBed",
      "entityId": 1001,
      "message": "The selected bed #101-A already has an active allocation.",
      "details": "Active allocation exists"
    }
  ]
}
```

---

## 7. Frontend Conflict UI Components

Located in `frontend/src/components/conflict/`:

- `<ConflictBadge>`: Renders high-contrast, theme-colored badges for `ERROR` (Rose), `WARNING` (Amber), and `INFO` (Sky).
- `<ConflictAlert>`: Contextual banner indicating whether constraints were violated or passed.
- `<ConflictList>`: Granular item-by-item breakdown showing conflict code, affected entity ID, and readable diagnostic message.
- `<ConflictPanel>`: Unified container embedded in both `AcademicAllocationModal` and `HostelAllocationModal`. Disables confirm/allocate buttons whenever blocking errors are present.
