# AHRAO — Admin User Management Architecture

**Module:** Phase 6 — Admin User Management  
**Route:** `/admin/users`  
**Base API:** `/api/admin/users`  
**Authorization:** Enforces `@PreAuthorize("hasRole('ADMIN')")` at both class and endpoint levels.

---

## 1. Overview & Purpose
The Admin User Management module serves as the centralized institutional authority for identity governance, credential management, role provisioning, and account lifecycle monitoring across all 6 AHRAO institutional roles:
- `ADMIN`: Global system administration and governance
- `PRINCIPAL`: Institutional oversight and executive approvals
- `HOD`: Departmental curriculum and resource allocation
- `FACULTY`: Academic course schedules and teaching requests
- `STUDENT`: Course enrollment and hostel resident access
- `WARDEN`: Residential blocks, bed allocation, and facility upkeep

The module operates directly on real database records using database-level search, filtering, and server-side pagination with zero client-side data hallucination or mock fallback arrays.

---

## 2. API Endpoints Specification

All endpoints require a valid JWT Bearer token in the `Authorization` header possessing the `ROLE_ADMIN` granted authority. Unauthorized roles receive `403 Forbidden`; unauthenticated requests receive `401 Unauthorized`.

| Method | Endpoint | Description | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/admin/users` | List users with server-side search, filtering, and pagination | Query params: `search`, `role`, `status`, `page`, `size`, `sort` | `ApiResponse<PagedResponse<UserSummaryResponse>>` | 200, 401, 403 |
| `GET` | `/api/admin/users/{id}` | Retrieve comprehensive user details | None | `ApiResponse<UserSummaryResponse>` | 200, 401, 403, 404 |
| `POST` | `/api/admin/users` | Provision new institutional account | `CreateUserRequest` | `ApiResponse<UserSummaryResponse>` | 201, 400, 401, 403, 409 |
| `PUT` | `/api/admin/users/{id}` | Update existing user profile | `UpdateUserRequest` | `ApiResponse<UserSummaryResponse>` | 200, 400, 401, 403, 404, 409 |
| `PATCH` | `/api/admin/users/{id}/status` | Update account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING`) | `UpdateUserStatusRequest` | `ApiResponse<UserSummaryResponse>` | 200, 400, 401, 403, 404, 409 |
| `PATCH` | `/api/admin/users/{id}/roles` | Update assigned institutional roles | `UpdateUserRolesRequest` | `ApiResponse<UserSummaryResponse>` | 200, 400, 401, 403, 404, 409 |
| `POST` | `/api/admin/users/{id}/reset-password` | Administrative cryptographic password reset | `AdminResetPasswordRequest` | `ApiResponse<Void>` | 200, 400, 401, 403, 404 |

---

## 3. Data Transfer Objects (DTOs)

### `PagedResponse<T>`
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### `UserSummaryResponse`
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@ahrao.edu",
  "firstName": "Alexander",
  "lastName": "Vance",
  "phone": "+91 98765 00001",
  "status": "ACTIVE",
  "roles": ["ADMIN"],
  "permissions": ["USER_READ", "USER_WRITE", "SYSTEM_ADMIN"],
  "createdAt": "2026-09-01T10:00:00Z",
  "updatedAt": "2026-09-05T14:30:00Z",
  "lastLoginAt": "2026-09-05T14:30:00Z"
}
```

### `CreateUserRequest`
```json
{
  "username": "faculty_jane",
  "email": "jane@ahrao.edu",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+91 98765 12345",
  "roles": ["FACULTY"],
  "status": "ACTIVE"
}
```

### `UpdateUserRequest`
```json
{
  "email": "jane.doe@ahrao.edu",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+91 98765 54321",
  "status": "ACTIVE",
  "roles": ["FACULTY"]
}
```

---

## 4. Query Optimization & Database Safeguards

1. **JPA Specifications:**
   Dynamic database-level queries construct parameter-bound criteria without concatenating raw SQL:
   - Case-insensitive search across `username`, `email`, `firstName`, and `lastName`.
   - Exact enum matching for `status`.
   - Inner join on `roles` collection for `role` filtering with distinct execution.
2. **No in-memory table loading:**
   `findAll(Specification, Pageable)` pushes pagination parameters (`LIMIT`, `OFFSET`) down to MySQL, guaranteeing low memory footprint and sub-second response times even with large directories.
3. **Database Uniqueness Checks:**
   `existsByUsername()` and `existsByEmail()` guard against duplicates, raising 409 Conflict errors without exposing raw SQL constraint violation traces.

---

## 5. Critical Security Protections

### Last-Admin Protection
The system ensures that administrative access can never be severed:
- When changing an administrator's status to non-`ACTIVE` (`INACTIVE` or `SUSPENDED`), or removing the `ADMIN` role from an active administrator, the service executes:
  ```sql
  SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ADMIN' AND u.status = 'ACTIVE' AND u.id <> :userId
  ```
- If the count of remaining active administrators is 0, the operation is rejected with `409 Conflict`:
  > *"Action rejected: Cannot deactivate or suspend the last active administrator"* or  
  > *"Action rejected: Cannot remove ADMIN role from the last active administrator"*

### Self-Lockout Prevention
An authenticated administrator is prevented from inadvertently disabling their own account:
- If the logged-in administrator's username matches the target user's username:
  - Attempting to set status to `INACTIVE` or `SUSPENDED` throws `409 Conflict`:  
    > *"Action rejected: Administrators cannot deactivate or suspend their own account"*
  - Attempting to remove the `ADMIN` role from their own account throws `409 Conflict`:  
    > *"Action rejected: Administrators cannot remove the ADMIN role from their own account"*

### Authentication Integration
- The Spring Security `CustomUserDetails` model maps:
  - `isEnabled()` to `status == UserStatus.ACTIVE`
  - `isAccountNonLocked()` to `status != UserStatus.SUSPENDED`
- When an administrator suspends or deactivates an account, existing sessions cannot re-authenticate, and future login attempts are rejected with `DisabledException` or `LockedException` mapped to `401 Unauthorized`.

### Credential Protection
- Passwords are encrypted exclusively via `BCryptPasswordEncoder`.
- Passwords and password hashes are never included in DTO responses, UI state, or log records.

---

## 6. Audit Logging
Meaningful administrative actions are immutably appended to the `audit_logs` table with client IP address and User-Agent:
- `USER_CREATED`: Initial provisioning with assigned roles
- `USER_UPDATED`: Modification of non-sensitive profile attributes
- `USER_STATUS_UPDATED`: Transition of account status (old status -> new status)
- `USER_ROLES_UPDATED`: Modification of assigned roles (old roles -> new roles)
- `ADMIN_PASSWORD_RESET`: Password reset by administrator for target account

---

## 7. Frontend Integration
The `/admin/users` interface provides:
- **Server-side Search Toolbar:** Debounced search query (350ms) querying backend without UI stutter.
- **Role and Status Filters:** Instant reload with page reset to index 0.
- **Telemetry Counter Cards:** Displays total filtered records and live page breakdown.
- **Empty & Error States:** Reusable `EmptyState` and `ErrorMessage` components with retry action.
- **Confirmation Dialogs:** Reusable `ConfirmDialog` for critical operations like account suspension and reactivation.
- **Pagination Component:** 1-indexed to 0-indexed translation matching Spring Data page semantics.
