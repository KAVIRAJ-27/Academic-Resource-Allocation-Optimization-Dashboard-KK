# AHRAO — Admin Student Management Architecture

**Module:** Phase 7 — Admin Student Management  
**Frontend Route:** `/admin/students`  
**Backend Base API:** `/api/admin/students`  
**Authorization:** Enforces `@PreAuthorize("hasRole('ADMIN')")` at class and endpoint levels.

---

## 1. Overview & Purpose
The Admin Student Management module provides centralized governance over student academic records, program enrollments, semester standing, and academic section assignments across the entire institution.

Core capabilities:
- **Registry Viewing & Server-Side Pagination:** Efficient, parameter-bound database pagination (`GET /api/admin/students?page=0&size=20`).
- **Server-Side Multi-Criteria Search:** Fast querying by register number, student name, username, or email.
- **Hierarchical Server-Side Filtering:** Multi-criteria filtering across Department, Program/Course, Section, and Status.
- **Dual-Mode Student Provisioning:**
  1. Link an existing unassigned `STUDENT` user account.
  2. Simultaneously provision a new user account with BCrypt password hashing and automatic `STUDENT` role assignment.
- **Strict Academic Hierarchy Validation:** Logical relationship enforcement (`Program ∈ Department`, `Section ∈ Program`).
- **Conflict Prevention:** Strict uniqueness checks for register numbers and 1:1 User-to-Student relationships.
- **Status Governance:** Safe academic status management (`ACTIVE`, `INACTIVE`, `SUSPENDED`) with audit logging.
- **Reference Data Integration:** Single consolidated reference data endpoint (`/reference-data`) feeding dependent dropdowns with zero UI cascade delay.

---

## 2. API Endpoints Specification

All endpoints require a valid JWT Bearer token possessing the `ROLE_ADMIN` authority. Unauthenticated requests receive `401 Unauthorized`; non-admin roles receive `403 Forbidden`.

| Method | Endpoint | Description | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/admin/students` | List students with server-side search, filtering, and pagination | Query params: `search`, `departmentId`, `programId`, `sectionId`, `status`, `page`, `size`, `sort` | `ApiResponse<PagedResponse<StudentSummaryResponse>>` | 200, 401, 403 |
| `GET` | `/api/admin/students/{id}` | Retrieve comprehensive student profile, academic structure, and account metadata | None | `ApiResponse<StudentDetailsResponse>` | 200, 401, 403, 404 |
| `GET` | `/api/admin/students/reference-data` | Retrieve consolidated departments, programs, sections, and unassigned student users | None | `ApiResponse<StudentReferenceDataResponse>` | 200, 401, 403 |
| `POST` | `/api/admin/students` | Provision student academic record with dual-mode user creation/link | `CreateStudentRequest` | `ApiResponse<StudentSummaryResponse>` | 201, 400, 401, 403, 409 |
| `PUT` | `/api/admin/students/{id}` | Update student academic allocation and linked user profile | `UpdateStudentRequest` | `ApiResponse<StudentSummaryResponse>` | 200, 400, 401, 403, 404, 409 |
| `PATCH` | `/api/admin/students/{id}/status` | Update student status (`ACTIVE`, `INACTIVE`, `SUSPENDED`) | `UpdateStudentStatusRequest` | `ApiResponse<StudentSummaryResponse>` | 200, 400, 401, 403, 404 |

---

## 3. Data Transfer Objects (DTOs)

### `StudentSummaryResponse`
Flat tabular representation optimized for directory rendering:
```json
{
  "id": 1,
  "registerNumber": "23CS001",
  "rollNumber": "CSE-01",
  "studentName": "Alex Brooks",
  "email": "alex@ahrao.edu",
  "phone": "+91 98765 43210",
  "userId": 10,
  "username": "student_alex",
  "userStatus": "ACTIVE",
  "departmentId": 1,
  "departmentName": "Computer Science and Engineering",
  "departmentCode": "CSE",
  "programId": 2,
  "programName": "B.Tech Computer Science and Engineering",
  "programCode": "BTECH_CSE",
  "sectionId": 3,
  "sectionName": "Section A",
  "admissionYear": 2023,
  "currentSemester": 3,
  "status": "ACTIVE",
  "createdAt": "2026-09-01T10:00:00Z",
  "updatedAt": "2026-09-05T14:30:00Z"
}
```

### `StudentDetailsResponse`
Full academic and account identity profile:
```json
{
  "id": 1,
  "registerNumber": "23CS001",
  "rollNumber": "CSE-01",
  "admissionYear": 2023,
  "currentSemester": 3,
  "status": "ACTIVE",
  "createdAt": "2026-09-01T10:00:00Z",
  "updatedAt": "2026-09-05T14:30:00Z",
  "userId": 10,
  "username": "student_alex",
  "email": "alex@ahrao.edu",
  "firstName": "Alex",
  "lastName": "Brooks",
  "phone": "+91 98765 43210",
  "userStatus": "ACTIVE",
  "roles": ["STUDENT"],
  "userLastLoginAt": "2026-09-05T12:00:00Z",
  "departmentId": 1,
  "departmentName": "Computer Science and Engineering",
  "departmentCode": "CSE",
  "programId": 2,
  "programName": "B.Tech Computer Science and Engineering",
  "programCode": "BTECH_CSE",
  "degreeType": "UNDERGRADUATE",
  "durationYears": 4,
  "sectionId": 3,
  "sectionName": "Section A",
  "sectionCapacity": 60
}
```

### `CreateStudentRequest`
Supports both creating a new user or linking an existing one:
```json
{
  "registerNumber": "23CS002",
  "rollNumber": "CSE-02",
  "departmentId": 1,
  "programId": 2,
  "sectionId": 3,
  "admissionYear": 2023,
  "currentSemester": 1,
  "status": "ACTIVE",
  "userId": null,
  "username": "jane_doe",
  "email": "jane.doe@ahrao.edu",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+91 98765 11111"
}
```

### `UpdateStudentRequest`
Allows updating academic allocations and non-sensitive profile attributes:
```json
{
  "registerNumber": "23CS001",
  "rollNumber": "CSE-01-A",
  "departmentId": 1,
  "programId": 2,
  "sectionId": 3,
  "admissionYear": 2023,
  "currentSemester": 4,
  "status": "ACTIVE",
  "email": "alex.brooks@ahrao.edu",
  "firstName": "Alexander",
  "lastName": "Brooks",
  "phone": "+91 98765 99999"
}
```

---

## 4. Query Optimization & Search Architecture

1. **JPA Specifications:**
   Search queries use parameterized JPA Specifications (`StudentSpecification`) to ensure queries execute directly in the database without SQL injection vulnerabilities:
   - Case-insensitive search: `registerNumber LIKE %term% OR user.username LIKE %term% OR user.email LIKE %term% OR CONCAT(user.firstName, ' ', user.lastName) LIKE %term%`.
   - Filters: exact match on `department.id`, `program.id`, `section.id`, and `status`.
2. **Server-Side Pagination:**
   `findAll(Specification, Pageable)` pushes `LIMIT` and `OFFSET` queries to MySQL, returning `PagedResponse` with complete pagination metadata (`content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`).
3. **No In-Memory Filtering:**
   Zero database dumps to memory. Zero client-side filtering.

---

## 5. Relationship Validation & Integrity Safeguards

### Academic Structure Validation
When provisioning or updating a student:
- Department must exist (`departmentRepository.findById`).
- Program must exist (`programRepository.findById`).
- **Hierarchy Integrity Check 1:** Selected Program must belong to the selected Department:
  ```java
  if (!program.getDepartment().getId().equals(department.getId())) {
      throw new BadRequestException("Program " + program.getName() + " does not belong to Department " + department.getName());
  }
  ```
- **Hierarchy Integrity Check 2:** If Section is provided, Section must belong to the selected Program:
  ```java
  if (!section.getProgram().getId().equals(program.getId())) {
      throw new BadRequestException("Section " + section.getName() + " does not belong to Program " + program.getName());
  }
  ```
Violations immediately return `400 Bad Request` with a safe, descriptive message.

### Register Number Uniqueness
- Register number uniqueness is enforced before insert/update:
  ```java
  if (studentRepository.existsByRegisterNumber(registerNumber)) {
      throw new ConflictException("Register number '" + registerNumber + "' already exists.");
  }
  ```
- Duplicate attempts return `409 Conflict`. Raw database constraint exceptions are never exposed to clients.

### User-Student Relationship Integrity
- A User can be linked to at most ONE Student record (1:1 mapping).
- If linking an existing user:
  - User must exist.
  - User must possess the `STUDENT` role (cannot assign Admin, HOD, Faculty, Principal, or Warden).
  - User must not already be linked to another Student:
    ```java
    if (studentRepository.existsByUserId(userId)) {
        throw new ConflictException("User account is already linked to another student record.");
    }
    ```
- If provisioning a new user:
  - Unique username and email checks are enforced (`existsByUsername`, `existsByEmail`).
  - Password hashed using `BCryptPasswordEncoder`.
  - Assigned exclusively the `STUDENT` role.

---

## 6. Security & Audit Logging

### Authorization
- Class-level and method-level `@PreAuthorize("hasRole('ADMIN')")`.
- JWT access tokens must contain `ROLE_ADMIN` in authorities.
- Passwords and password hashes are never included in DTO responses or log entries.

### Immutable Audit Trail
Meaningful administrative events are logged to the `audit_logs` table with username, client IP, User-Agent, and metadata:
- `STUDENT_CREATED`: Provisioning of student record, register number, department, and linked user ID.
- `STUDENT_UPDATED`: Modification of academic allocation or profile details.
- `STUDENT_STATUS_CHANGED`: Academic status transitions (`ACTIVE` <-> `INACTIVE` <-> `SUSPENDED`).
- `USER_CREATED`: Logged when a new user account is simultaneously created.

---

## 7. Frontend Architecture

- **Page:** `StudentManagementPage.tsx` (`/admin/students`)
- **Hook:** `useAdminStudents.ts` managing:
  - Server-side debounced search (350ms).
  - Multi-level cascading dropdown filters (Department -> Program -> Section -> Status).
  - Pagination state management (0-based backend translation).
  - Modals (Add, Edit, View Details, Confirm Status Dialog).
- **Service:** `adminStudentApi.ts` encapsulating Axios calls to `/api/admin/students/**`.
- **Dependent Dropdown Logic:**
  - When Department changes in create/edit modal, available Programs are dynamically filtered.
  - When Program changes, available Sections are dynamically filtered.
  - Incompatible selections are automatically reset.
- **Empty & Loading States:**
  - `SkeletonTable` while fetching.
  - `EmptyState` (`preset="no-students"`) when no records match.
  - `ErrorMessage` alert with retry on server failure.
  - Reusable `ConfirmDialog` for status changes.
