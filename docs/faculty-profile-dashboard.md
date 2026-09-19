# Faculty Profile & Dashboard Module (Phase 17)

PROJECT: Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)

## 1. Overview

The **Faculty Profile & Dashboard Module** delivers a role-restricted, production-grade portal for authenticated faculty members (`ROLE_FACULTY`). It allows faculty to:

1. Review verified academic credentials, employment lineage, designation, and department details.
2. Safely update permitted contact and personal information (`firstName`, `lastName`, `phone`, `qualification`).
3. View real-time database telemetry on the **Faculty Dashboard** (`GET /api/faculty/dashboard`), including:
   - Assigned Courses/Subjects (`FacultySubjectAssignment`)
   - Teaching Workload Allocation (`FacultyWorkload`)
   - Upcoming Timetable Schedule Matrix (`TimetableEntry`)
   - Academic Resource Requisitions (`AcademicResourceRequest`)
   - Recent Security & Action Audit Logs (`AuditLog`)
4. Experience graceful loading skeletons, descriptive empty states when data has not yet been populated (zero fake numbers or artificial metrics), and accessible navigation with placeholders for future Phase 18 & 19 capabilities.

---

## 2. Security & Ownership Model

### A. Zero-Trust Identity Resolution

All faculty endpoints reject arbitrary `facultyId` or `userId` parameters from the client. Identity is derived strictly from Spring Security's authenticated JWT principal:

```text
JWT Authenticated Principal
             ↓
  SecurityUtils.getCurrentUserId()
             ↓
       User Entity
             ↓
     Faculty Entity (via facultyRepository.findByUserId(userId))
```

### B. Role Enforcement

- All endpoints require `ROLE_FACULTY`. Unauthenticated requests receive `401 Unauthorized`. Users of other roles (`ROLE_STUDENT`, etc.) receive `403 Forbidden`.

### C. Permitted vs Protected Profile Fields

- **Permitted Self-Editable Fields**:
  - `firstName` (`@NotBlank`, `@Size(min = 1, max = 50)`)
  - `lastName` (`@NotBlank`, `@Size(min = 1, max = 50)`)
  - `phone` (`@Pattern(regexp = "^$|^[+0-9\\-\\s()]{7,20}$")`)
  - `qualification` (`@Size(max = 100)`)
- **Strictly Read-Only Administrative Fields**:
  - `employeeId`
  - `department`
  - `designation`
  - `joiningDate`
  - `facultyStatus`
  - `email` & `username`
  - `roles` & `accountStatus`

### D. Audit Logging

Every profile modification creates an audit record:

- Action: `FACULTY_PROFILE_UPDATED`
- Entity: `FACULTY` (with faculty ID)
- Old and new values captured
- Client IP and User-Agent logged

---

## 3. API Endpoints

### 1. GET `/api/faculty/profile`

- **Role Required**: `ROLE_FACULTY`
- **Description**: Returns full profile of authenticated faculty member.
- **Response**: `200 OK`

```json
{
  "success": true,
  "message": "Faculty profile retrieved successfully",
  "data": {
    "userId": 42,
    "facultyId": 10,
    "firstName": "Alan",
    "lastName": "Turing",
    "fullName": "Alan Turing",
    "email": "alan.turing@univ.edu",
    "phone": "+1-555-0199",
    "qualification": "Ph.D. Mathematics",
    "employeeId": "FAC-0042",
    "designation": "Professor",
    "joiningDate": "2018-08-01",
    "facultyStatus": "ACTIVE",
    "departmentId": 2,
    "departmentName": "Computer Science and Engineering",
    "departmentCode": "CSE",
    "institutionName": "Apex Institute of Technology",
    "username": "prof_alan",
    "accountStatus": "ACTIVE",
    "roles": ["ROLE_FACULTY"],
    "lastLoginAt": "2026-09-06T09:30:00Z"
  }
}
```

### 2. PUT `/api/faculty/profile`

- **Role Required**: `ROLE_FACULTY`
- **Description**: Updates safe personal profile fields for the authenticated faculty member.
- **Request Body**:

```json
{
  "firstName": "Alan",
  "lastName": "M. Turing",
  "phone": "+1-555-9876",
  "qualification": "Ph.D. Mathematics, FRS"
}
```

- **Validation**:
  - `firstName`: Not blank, 1-50 chars
  - `lastName`: Not blank, 1-50 chars
  - `phone`: Valid format (7-20 chars)
  - `qualification`: Max 100 chars
- **Response**: `200 OK` with updated `FacultyProfileDto`.

### 3. GET `/api/faculty/dashboard`

- **Role Required**: `ROLE_FACULTY`
- **Description**: Aggregated real database telemetry for faculty dashboard.
- **Response**: `200 OK`

```json
{
  "success": true,
  "message": "Faculty dashboard data retrieved successfully",
  "data": {
    "profile": {
      "facultyId": 10,
      "userId": 42,
      "fullName": "Alan Turing",
      "employeeId": "FAC-0042",
      "designation": "Professor",
      "qualification": "Ph.D. Mathematics",
      "email": "alan.turing@univ.edu",
      "phone": "+1-555-0199",
      "departmentName": "Computer Science and Engineering",
      "departmentCode": "CSE",
      "status": "ACTIVE",
      "joiningDate": "2018-08-01"
    },
    "department": {
      "departmentId": 2,
      "departmentName": "Computer Science and Engineering",
      "departmentCode": "CSE",
      "institutionName": "Apex Institute of Technology"
    },
    "metrics": {
      "assignedSubjectsCount": 2,
      "weeklyInstructionHours": 16,
      "upcomingClassesCount": 4,
      "pendingRequisitionsCount": 1
    },
    "assignedSubjects": [
      {
        "id": 101,
        "subjectId": 15,
        "subjectCode": "CS301",
        "subjectName": "Design & Analysis of Algorithms",
        "programName": "B.Tech Computer Science",
        "sectionName": "A",
        "academicYearName": "2024-2025",
        "semesterName": "Semester 5",
        "hoursPerWeek": 4,
        "status": "ACTIVE"
      }
    ],
    "workloadSummary": {
      "id": 5,
      "totalHours": 16.00,
      "teachingHours": 12.00,
      "labHours": 4.00,
      "otherHours": 0.00,
      "workloadStatus": "BALANCED",
      "academicYearName": "2024-2025",
      "semesterName": "Semester 5",
      "calculatedAt": "2026-09-01T10:00:00Z"
    },
    "timetableSummary": [
      {
        "id": 88,
        "subjectCode": "CS301",
        "subjectName": "Algorithms",
        "roomNumber": "LH-201",
        "roomName": "Lecture Hall 201",
        "dayOfWeek": "MONDAY",
        "startTime": "09:00:00",
        "endTime": "10:00:00",
        "sectionName": "Section A"
      }
    ],
    "requisitionSummary": {
      "pendingCount": 1,
      "approvedCount": 2,
      "totalCount": 3,
      "recentRequisitions": [
        {
          "id": 12,
          "resourceName": "High Performance Computing Lab",
          "categoryName": "Laboratory",
          "purpose": "Parallel algorithm benchmarks",
          "requestedDate": "2026-09-10",
          "startTime": "14:00:00",
          "endTime": "17:00:00",
          "priority": "HIGH",
          "status": "PENDING"
        }
      ]
    },
    "recentActivities": [
      {
        "id": 501,
        "action": "FACULTY_PROFILE_UPDATED",
        "description": "Profile contact information updated successfully",
        "createdAt": "2026-09-06T09:35:00Z"
      }
    ]
  }
}
```

---

## 4. Frontend Architecture

### Design System & Theme

Built according to the AHRAO SaaS aesthetic:

- **Root Background**: `#080A0F`
- **Surface Cards**: `#11141C` with border `#1E2330`
- **Elevated/Selected**: `#171A23`
- **Accent Primary**: Teal (`#14B8A6`), Purple (`#8B5CF6`), Blue (`#3B82F6`), Orange (`#F97316`)
- **Typography**: Clean sans-serif and tabular monospace numerals

### Components Created

1. `FacultyProfileCard.tsx`: Compact overview card displaying designation, employee ID, department, email, phone, and a "View Full Profile" action.
2. `FacultyKpiCards.tsx`: 4 live database metrics: Assigned Subjects, Weekly Instruction Hours, Scheduled Classes, and Pending Requisitions.
3. `FacultySubjectsCard.tsx`: Read-only course assignments or clean empty state ("No subject assignments found.").
4. `FacultyWorkloadCard.tsx`: Workload hours distribution and balance badge, or empty state ("Workload information is not currently available.").
5. `FacultyTimetableCard.tsx`: Weekly schedule matrix or empty state ("Timetable information will appear here when available.").
6. `FacultyRequisitionsCard.tsx`: Requisition tracking or empty state ("No faculty resource requests found.").
7. `FacultyActivityCard.tsx`: Security and action audit history or empty state ("No recent activity.").
8. `FacultyDashboardSkeleton.tsx`: Animated loading skeleton matching dark SaaS cards.
9. `FacultyProfilePage.tsx`: Full profile page with personal info form (editable phone, qualification, names), read-only employment & department info, account credentials, and save feedback alerts.

---

## 5. Verification & Test Coverage

- **Backend Tests**: 55 automated unit & security tests passing (100% pass rate).
  - `FacultyProfileSecurityTest`: 4 tests
  - `FacultyDashboardSecurityTest`: 2 tests
  - `FacultyProfileServiceTest`: 4 tests
  - `FacultyDashboardServiceTest`: 3 tests
  - Full regression with student tests: 42 tests
- **Frontend Build**: `npm run build` (`tsc -b && vite build`) compiles with zero TypeScript errors and zero lint errors in ~12 seconds.
