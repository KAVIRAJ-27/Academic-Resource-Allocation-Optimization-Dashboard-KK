# Phase 29: Hostel Resource Allocation Engine

> **Module:** Phase 29 — Hostel Resource Allocation Engine  
> **Status:** Production-Ready & Verified  
> **Backend:** Spring Boot 3.3 / Spring Security 6 / Spring Data JPA (Pessimistic Locking `findByIdWithLock`)  
> **Frontend:** React 18 / Vite / TypeScript / Tailwind CSS Dark Theme  
> **Primary Routes:** `/hostel/resource-allocations`, `/hostel/resource-allocations/:id`  
> **Base API:** `/api/hostel/resource-allocations`  
> **Security:** `@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN')")` with Warden scope isolation  

---

## 1. Executive Summary & Objective

The **Hostel Resource Allocation Engine (Phase 29)** provides an enterprise-grade, deterministic backend engine and intuitive frontend operational dashboard for allocating residential hostel beds to student requests.

The engine transforms unstructured hostel demand into conflict-free, concurrency-safe, auditable bed assignments without relying on stochastic, genetic, or machine learning algorithms:

```text
Hostel Request
      ↓
Eligibility Validation
      ↓
Hostel Scope Validation
      ↓
Candidate Bed Selection
      ↓
Availability Check
      ↓
Conflict Detection
      ↓
Allocation (Atomic Transaction + Pessimistic Lock)
      ↓
Audit Log
```

---

## 2. Core Architectural Principles

1. **Deterministic Candidate Selection**: Allocates candidates through strict, predictable ordering (Requested Hostel &rarr; Lowest Block ID &rarr; Lowest Floor Number &rarr; Lowest Room ID &rarr; Lowest Bed ID).
2. **Multi-Tier Capacity & Status Safeguards**: Enforces active status checks and non-overflow invariants across all six hierarchy tiers (`Institution` &rarr; `Hostel` &rarr; `HostelBlock` &rarr; `HostelFloor` &rarr; `HostelRoom` &rarr; `HostelBed`).
3. **Pessimistic Locking & Concurrency Protection**: Uses `findByIdWithLock(bedId)` with `LockModeType.PESSIMISTIC_WRITE` to prevent race conditions when concurrent wardens or automated jobs attempt to assign the same bed simultaneously.
4. **Warden Scoping & Data Isolation**: Wardens are strictly restricted to hostels assigned via `WardenScopeService`. Admins retain full campus-wide allocation authority.
5. **Idempotent & Historical Lifecycle**: All state changes (`AVAILABLE` &harr; `OCCUPIED`) and allocation records (`ACTIVE` &rarr; `COMPLETED`) preserve historical audit trails without hard deletes.

---

## 3. Data Model & Hierarchy Reuse

Phase 29 reuses existing relational entities without duplicating domain structures:

```mermaid
graph TD
    Inst[Institution] --> Hst[Hostel]
    Hst --> Blk[HostelBlock]
    Blk --> Flr[HostelFloor]
    Flr --> Rm[HostelRoom]
    Rm --> Bed[HostelBed]
    Bed --> Alloc[HostelAllocation]
    Stu[Student] --> Alloc
    Req[HostelRequest] -.-> Alloc
    Wrd[Warden] -->|WardenHostels| Hst
    Usr[User / Actor] --> Audit[AuditLog]
```

---

## 4. Allocation Lifecycles & Validation Rules

### 4.1 Strict Eligibility Validations

Before committing any allocation, the backend validates:

1. **Student Active**: `Student` entity and linked `User` account must have `ACTIVE` status. Otherwise rejected with `STUDENT_INACTIVE`.
2. **Single Active Allocation**: A student can possess at most one `ACTIVE` hostel allocation campus-wide. Violations throw `STUDENT_ALREADY_ALLOCATED`.
3. **Hierarchy Integrity**: Bed must belong to specified Room, Room to Floor, Floor to Block, Block to Hostel. Inactive blocks, floors, or rooms fail with `HOSTEL_BLOCK_INACTIVE`, `HOSTEL_FLOOR_INACTIVE`, or `ROOM_INACTIVE`.
4. **Bed Availability**: Bed status must be `AVAILABLE`. Non-available beds throw `BED_NOT_AVAILABLE`.
5. **Bed Uniqueness**: Bed must have zero concurrent `ACTIVE` allocations. Violations throw `BED_ALREADY_ALLOCATED`.
6. **Room Capacity**: Active allocations in the room must be strictly less than `room.capacity`. Violations throw `ROOM_CAPACITY_EXCEEDED`.
7. **Hostel Capacity**: Active allocations across the entire hostel building must be strictly less than `hostel.capacity`. Violations throw `HOSTEL_CAPACITY_EXCEEDED`.
8. **Warden Scope**: If initiated by a Warden, the target hostel must belong to `wardenScopeService.getAuthorizedHostelIds()`. Violations return `403 Forbidden` (`UNAUTHORIZED_HOSTEL_SCOPE`).

---

## 5. API Endpoints Specification

### Base Path: `/api/hostel/resource-allocations`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/preview` | Dry-run allocation simulation (zero mutations) | `ADMIN`, `PRINCIPAL`, `HOD`, `WARDEN` |
| `POST` | `/manual` or `/` | Explicit manual allocation of a specific bed | `ADMIN`, `PRINCIPAL`, `HOD`, `WARDEN` |
| `POST` | `/auto` | Deterministic automatic allocation matching request | `ADMIN`, `PRINCIPAL`, `HOD`, `WARDEN` |
| `GET` | `/` | Paged search and filtering of allocations | `ADMIN`, `PRINCIPAL`, `HOD`, `WARDEN` |
| `GET` | `/{id}` | Single allocation detail view | `ADMIN`, `PRINCIPAL`, `HOD`, `WARDEN` |
| `POST` / `PATCH` | `/{id}/release` | Release/checkout bed allocation to `COMPLETED` | `ADMIN`, `PRINCIPAL`, `HOD`, `WARDEN` |

---

## 6. Sample Request & Response Payloads

### 6.1 Preview Allocation (`POST /api/hostel/resource-allocations/preview`)

### Request:

```json
{
  "studentId": 100,
  "hostelRequestId": 99,
  "hostelId": 10
}
```

### Success Response:

```json
{
  "success": true,
  "message": "Hostel allocation preview generated",
  "data": {
    "eligible": true,
    "candidateCount": 8,
    "recommendedBed": {
      "bedId": 101,
      "bedNumber": "B1",
      "roomId": 40,
      "roomNumber": "101",
      "floorId": 30,
      "floorNumber": 1,
      "blockId": 20,
      "blockName": "Block A",
      "hostelId": 10,
      "hostelName": "Nilgiri Hostel",
      "available": true
    },
    "eligibleCandidates": [...],
    "unavailableCandidates": [],
    "conflicts": [],
    "reason": "First available eligible bed in the authorized hostel scope (Nilgiri Hostel, Room 101)."
  }
}
```

### 6.2 Manual Allocation (`POST /api/hostel/resource-allocations/manual`)

### Request:

```json
{
  "studentId": 100,
  "hostelId": 10,
  "roomId": 40,
  "bedId": 101,
  "hostelRequestId": 99,
  "startDate": "2026-09-01",
  "endDate": "2027-05-31"
}
```

### Response (`201 Created`):

```json
{
  "success": true,
  "message": "Hostel bed allocated successfully",
  "data": {
    "id": 500,
    "studentId": 100,
    "studentName": "Arun Kumar",
    "rollNumber": "CS2026-001",
    "departmentName": "Computer Science",
    "hostelId": 10,
    "hostelName": "Nilgiri Hostel",
    "blockId": 20,
    "blockName": "Block A",
    "floorId": 30,
    "floorNumber": 1,
    "roomId": 40,
    "roomNumber": "101",
    "roomType": "DOUBLE",
    "capacity": 2,
    "bedId": 101,
    "bedNumber": "B1",
    "hostelRequestId": 99,
    "status": "ACTIVE",
    "allocationMethod": "MANUAL",
    "startDate": "2026-09-01",
    "endDate": "2027-05-31",
    "allocatedAt": "2026-09-09T15:13:29Z"
  }
}
```

### 6.3 Release Allocation (`POST /api/hostel/resource-allocations/{id}/release`)

### Response:

```json
{
  "success": true,
  "message": "Hostel allocation released successfully",
  "data": {
    "id": 500,
    "status": "COMPLETED",
    "releasedAt": "2026-09-09T15:13:30Z"
  }
}
```

---

## 7. Audit Logging

Every state transition generates an immutable `AuditLog` entry:

- `MANUAL_HOSTEL_ALLOCATION`: Manual bed assignment record with actor, student, bed, and room telemetry.
- `AUTO_HOSTEL_ALLOCATION`: Automated candidate selection and reservation record.
- `HOSTEL_ALLOCATION_RELEASED`: Completion and checkout event restoring bed to `AVAILABLE`.

---

## 8. Verification & Test Suite Summary

- **Unit & Business Logic Tests**: `HostelResourceAllocationServiceTest` (18 scenarios, 100% pass rate).
- **Security & RBAC Tests**: `HostelResourceAllocationSecurityTest` (4 role & permission scenarios, 100% pass rate).
- **Overall Allocation Matrix**: 65 test methods passing across academic, hostel, warden, HOD, and principal suites.
- **Frontend SPA**: Clean Vite production compilation (`npm run build`: 2,604 modules transformed, 0 errors).
