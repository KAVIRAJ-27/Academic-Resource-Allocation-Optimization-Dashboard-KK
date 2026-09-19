# Student Profile & Dashboard Module (Phase 12)

## 1. Overview

The **Student Profile & Dashboard Module** (Phase 12 of the Academic & Hostel Resource Allocation Optimization Dashboard - AHRAO) provides enrolled students with a personalized, secure, role-restricted dashboard and identity profile.

The module allows students to:

1. Inspect verified academic enrollment details, departmental hierarchy, and semester context.
2. View designated residential hostel accommodations (hostel, block, floor, room, and bed space).
3. Safely update allowed contact information (phone, first name, last name).
4. Review authenticated security sessions, roles, and real audit log activity.
5. Access real database telemetry without any mock or fabricated data.

---

## 2. Security & Ownership Rules

1. **Role-Based Endpoint Protection**:
   - All endpoints under `/api/student/dashboard` and `/api/student/profile` are secured with `@PreAuthorize("hasRole('STUDENT')")`.
   - Admin, Faculty, HOD, Warden, or unauthenticated users attempting access receive `403 Forbidden` or `401 Unauthorized`.

2. **Strict Backend Ownership Validation**:
   - The user identity is retrieved exclusively from Spring Security's authenticated context:

```text
     SecurityUtils.getCurrentUserId()
              ↓
     User entity
              ↓
     Student linked to User
     ```

   - Endpoints do **NOT** accept arbitrary `studentId` or `userId` query/body parameters.
   - Cross-student access or modification is architecturally impossible.

3. **Field Editability Rules**:
   - **Allowed Editable Fields**:
     - `firstName` (`@Size(min = 1, max = 50)`)
     - `lastName` (`@Size(min = 1, max = 50)`)
     - `phone` (`@Pattern(regexp = "^[+]?[0-9\\s()-]{7,20}$")`)
   - **Strictly Immutable Fields (Read-Only for Students)**:
     - Register Number & Roll Number
     - Department & Program
     - Section & Academic Year
     - Current Semester
     - Account Roles (`ROLE_STUDENT`) & Account Status (`ACTIVE`)
     - University Email & Username
     - Hostel Allocations

4. **Audit Logging**:
   - Every profile modification automatically generates an audit log record (`STUDENT_PROFILE_UPDATED`) recording user ID, modified attributes, client IP, and User-Agent without storing sensitive credentials.

---

## 3. API Endpoints

| Method | Endpoint | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/student/dashboard` | Aggregated student dashboard metrics, course load, timetable hours, hostel status, and recent activity | `STUDENT` |
| `GET` | `/api/student/profile` | Complete profile details (personal, academic lineage, account credentials, hostel allocation) | `STUDENT` |
| `PUT` | `/api/student/profile` | Update allowed contact details (first name, last name, phone) with validation and audit log | `STUDENT` |

---

## 4. Data Models

### `StudentDashboardDto`

```json
{
  "student": {
    "id": 101,
    "name": "Alex Mercer",
    "registerNumber": "2023CS101",
    "rollNumber": "CS-042",
    "email": "alex.mercer@univ.edu",
    "phone": "+1-555-0199",
    "status": "ACTIVE"
  },
  "academic": {
    "departmentName": "Computer Science & Engineering",
    "departmentCode": "CSE",
    "programName": "B.Tech Computer Science",
    "programCode": "BT-CS",
    "currentSemester": 3,
    "sectionName": "A",
    "academicYearName": "2024-2025"
  },
  "hostel": {
    "allocated": true,
    "hostelName": "Nelson Mandela Hostel",
    "blockName": "Block C",
    "floorNumber": 2,
    "roomNumber": "204",
    "bedNumber": "B1",
    "allocationStatus": "ACTIVE"
  },
  "metrics": {
    "enrolledCoursesCount": 6,
    "weeklyClassHours": 24,
    "hostelAllocated": true,
    "activeAllocationsCount": 0,
    "pendingRequestsCount": 0
  },
  "recentActivities": [
    {
      "id": 842,
      "action": "STUDENT_PROFILE_UPDATED",
      "description": "Student profile information updated successfully",
      "timestamp": "2026-09-06T08:45:00Z"
    }
  ]
}
```

### `StudentProfileDto`

```json
{
  "studentId": 101,
  "userId": 45,
  "firstName": "Alex",
  "lastName": "Mercer",
  "fullName": "Alex Mercer",
  "email": "alex.mercer@univ.edu",
  "phone": "+1-555-0199",
  "registerNumber": "2023CS101",
  "rollNumber": "CS-042",
  "admissionYear": 2023,
  "currentSemester": 3,
  "status": "ACTIVE",
  "departmentId": 2,
  "departmentName": "Computer Science & Engineering",
  "departmentCode": "CSE",
  "programId": 5,
  "programName": "B.Tech Computer Science",
  "programCode": "BT-CS",
  "degreeLevel": "B_TECH",
  "durationYears": 4,
  "sectionId": 12,
  "sectionName": "A",
  "academicYearId": 3,
  "academicYearName": "2024-2025",
  "username": "alex.mercer",
  "userStatus": "ACTIVE",
  "roles": ["ROLE_STUDENT"],
  "lastLoginAt": "2026-09-06T08:30:00Z",
  "hostelAllocated": true,
  "hostelAllocationId": 15,
  "hostelName": "Nelson Mandela Hostel",
  "blockName": "Block C",
  "floorNumber": 2,
  "roomNumber": "204",
  "bedNumber": "B1",
  "allocationStatus": "ACTIVE",
  "allocationStartDate": "2024-08-01"
}
```

---

## 5. Verification & Test Suite

- **Backend Tests (21 passing)**:
  - `StudentProfileSecurityTest`: 5 unit tests verifying role authorization, unauthenticated access rejection (401), and update execution.
  - `StudentDashboardServiceTest`: 5 unit tests verifying profile resolution, real database metric calculations, empty hostel state handling, and audit logging.
  - `StudentAcademicSecurityTest`: 5 tests verifying student academic endpoints.
  - `StudentAcademicServiceTest`: 6 tests verifying student academic curriculum.
- **Frontend Production Build**:
  - Validated with `tsc -b && vite build` (0 errors).
