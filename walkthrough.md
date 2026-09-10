# AHRAO — Verification & Implementation Walkthrough

## Phase 27: Warden Operations (Hostel Resources, Complaints & Maintenance)
## Phase 28: Academic Resource Allocation Engine
## Phase 29: Hostel Resource Allocation Engine

---

## 1. Overview of Phase 27 Completion
Phase 27 delivers operational control to Wardens over their assigned hostels:
1. **Hostel Resources/Facilities**: View, filter, and update status (`ACTIVE`, `INACTIVE`, `MAINTENANCE`) and descriptions of hostel facilities.
2. **Hostel Complaints**: End-to-end complaint triage, filtering by priority and status, and strict state transitions:
   - `OPEN` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `CLOSED` / `REJECTED`
3. **Maintenance Requests**: Complete work order tracking, reporting issues directly from the dashboard, assigning technicians, and managing work order lifecycle:
   - `OPEN` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED` / `CANCELLED`
4. **Scope Security & Aggregation**: Wardens are strictly restricted to hostels assigned via `WardenScopeService`. Real-time telemetry is aggregated for beds, resident count, open maintenance orders, and active complaints.

---

## 2. Overview of Phase 28 Completion
Phase 28 establishes AHRAO's core **Academic Resource Allocation Engine**:
1. **Academic Allocation Engine**:
   - Deterministic candidate selection prioritizing matching room types, capacity constraints, building proximity, and department affinity.
   - Rigorous multi-factor conflict detection: time window overlap, classroom/lab double-booking, section schedule conflicts, and faculty teaching conflicts.
   - Transactional, concurrency-safe allocation (`findByIdWithLock`, optimistic/pessimistic locking) with rollback semantics.
   - Comprehensive status tracking (`ALLOCATED`, `CANCELLED`, `COMPLETED`).
2. **APIs**:
   - `POST /api/academic/allocations/preview`: Dry-run conflict checker returning matching candidate scores, conflict explanations, and recommendations.
   - `POST /api/academic/allocations/auto`: Deterministic auto-allocation matching pending academic requests.
   - `POST /api/academic/allocations/manual`: Manual explicit allocation with validation checks.
   - `POST /api/academic/allocations/{id}/cancel`: Safe release and cancellation of academic allocations.
   - `GET /api/academic/allocations`: Paged search, filter by institution, building, department, semester, and status.

---

## 3. Overview of Phase 29 Completion
Phase 29 delivers the **Hostel Resource Allocation Engine**:
1. **Deterministic Candidate Selection**:
   - Resolves target hostel based on request or user scope.
   - Sorts candidate beds strictly by `Hostel ID ASC` &rarr; `Block ID ASC` &rarr; `Floor Number ASC` &rarr; `Room ID ASC` &rarr; `Bed ID ASC`.
   - Filters candidate beds by status `AVAILABLE` and room status `AVAILABLE`/active.
2. **Comprehensive Multi-Tier Validations**:
   - **Student**: Active student verification and single-allocation enforcement (`STUDENT_ALREADY_ALLOCATED`).
   - **Bed**: Availability verification (`BED_NOT_AVAILABLE`) and single-allocation enforcement (`BED_ALREADY_ALLOCATED`).
   - **Room**: Capacity overflow protection (`ROOM_CAPACITY_EXCEEDED`) and active status check (`ROOM_INACTIVE`).
   - **Hostel**: Overall capacity overflow protection (`HOSTEL_CAPACITY_EXCEEDED`) and active status check (`HOSTEL_INACTIVE`).
   - **Hierarchy**: Block active (`HOSTEL_BLOCK_INACTIVE`) and floor active (`HOSTEL_FLOOR_INACTIVE`) checks.
   - **Warden Scope**: Server-side authorization check restricting wardens to assigned hostels (`UNAUTHORIZED_HOSTEL_SCOPE`).
3. **Pessimistic Locking & Concurrency Protection**:
   - Acquires `findByIdWithLock(bedId)` with `LockModeType.PESSIMISTIC_WRITE`.
   - Re-validates student eligibility, bed availability, room capacity, and hostel capacity under lock to eliminate race conditions.
4. **REST APIs & Auditing**:
   - `POST /api/hostel/resource-allocations/preview`: Read-only allocation simulation returning candidate counts, recommended bed, and conflict diagnostics without mutating database state.
   - `POST /api/hostel/resource-allocations/manual` (and `/`): Explicit manual bed reservation.
   - `POST /api/hostel/resource-allocations/auto`: Automated deterministic candidate selection matching request.
   - `GET /api/hostel/resource-allocations`: Paged search and filter by student, hostel, block, room, bed, and status with Warden scope enforcement.
   - `GET /api/hostel/resource-allocations/{id}`: Allocation detail inspection with scope checks.
   - `POST` / `PATCH /api/hostel/resource-allocations/{id}/release`: Release allocation to `COMPLETED`, return bed to `AVAILABLE`, and reject double release (`ALLOCATION_ALREADY_RELEASED`).
   - Generates immutable `AuditLog` records for `MANUAL_HOSTEL_ALLOCATION`, `AUTO_HOSTEL_ALLOCATION`, and `HOSTEL_ALLOCATION_RELEASED`.

---

## 4. Backend Verification

### Test Suite Execution
- **Command**: `mvn test -Dtest=*Allocation*`
- **Result**: `65/65 TESTS PASSED` with 0 failures and 0 errors.

| Test Class | Tests Run | Result | Notes |
|---|---|---|---|
| `AcademicAllocationSecurityTest` | 5 | PASSED | Class and method `@PreAuthorize` role enforcement (`ADMIN`, `PRINCIPAL`, `HOD`) |
| `AcademicAllocationServiceTest` | 10 | PASSED | Conflict detection, capacity validation, auto/manual allocation, cancel |
| `HostelResourceAllocationSecurityTest`| 4 | PASSED | `@PreAuthorize` role checks and unauthenticated 401 handling |
| `HostelResourceAllocationServiceTest`| 18 | PASSED | Manual, auto, preview, duplicate checks, room/hostel capacity, scope, inactive entities, release, concurrency |
| `HodResourceAllocationSecurityTest` | 4 | PASSED | HOD department-scoped resource access |
| `HodResourceAllocationServiceTest` | 3 | PASSED | HOD cross-department boundary protections |
| `PrincipalAllocationSecurityTest` | 4 | PASSED | Principal institution-wide allocation privileges |
| `WardenAllocationSecurityTest` | 8 | PASSED | Scope verification for hostel room/bed assignment |
| `WardenAllocationServiceTest` | 9 | PASSED | Hostel room bed assignment logic and conflict resolution |

---

## 5. Frontend Verification

### TypeScript & Vite Build
- **Command**: `npx tsc --noEmit && npx vite build`
- **Modules Transformed**: 2,604 modules
- **Result**: `0 errors, build successful in 35.73s`
- **Key Frontend Artifacts**:
  - `frontend/src/types/hostelAllocation.ts`: Type definitions for allocation DTOs, candidates, and preview results.
  - `frontend/src/services/api/hostelAllocationApi.ts`: REST client methods for `/manual`, `/auto`, `/preview`, and `/release`.
  - `frontend/src/hooks/useHostelAllocations.ts`: Paged query, filtering, and release mutations.
  - `frontend/src/hooks/useHostelAllocationEngine.ts`: Simulation preview and auto/manual allocation state management.
  - `frontend/src/pages/hostel/HostelAllocationsPage.tsx`: Operational allocation dashboard with quick stats, filters, and release modal.
  - `frontend/src/pages/hostel/HostelAllocationModal.tsx`: Dual-mode (Auto & Manual) modal with preview simulation and candidate inspection.
  - `frontend/src/pages/hostel/HostelAllocationDetailPage.tsx`: Deep allocation audit view and checkout flow.
