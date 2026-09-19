# Student Academic Module (Phase 13)

## 1. Overview

The **Student Academic Module** (Phase 13 of the Academic & Hostel Resource Allocation Optimization Dashboard - AHRAO) delivers a unified, strictly **read-only** interface for enrolled students to inspect their institutional academic identity, curriculum hierarchy, enrolled course subjects, faculty instructor assignments, and weekly class timetable.

This module enforces strict zero-trust contextual security: students can only access academic telemetry, courses, and timetables corresponding strictly to their authenticated account's registered academic program and cohort section.

---

## 2. Core Functional Requirements & Architecture

### A. Academic Identity & Enrollment Overview

- Displays the student's full name, registration number, roll number, admission batch, and enrollment status (`ACTIVE`).
- Displays institutional hierarchy:
  - **Institution Profile**: University root and campus identification.
  - **Department Affiliation**: Academic department and department code.
  - **Degree Program**: Program name, degree level (Undergraduate, Postgraduate, Doctorate), and duration.
  - **Academic Session & Semester**: Current active academic year and enrolled semester number.
  - **Cohort Section**: Designated classroom section.
  - **Credit Summary**: Real-time aggregated registered credits and enrolled subject count.

### B. Curriculum & Enrolled Subjects

- Tabular and responsive card views of all subjects registered under the student's program and semester.
- Subject metadata:
  - Subject Code (e.g., `CS301`)
  - Subject Title (e.g., `Database Management Systems`)
  - Semester Number
  - Subject Type (`THEORY`, `PRACTICAL`, `PROJECT`, `ELECTIVE`)
  - Credits
  - Status (`ACTIVE`, `INACTIVE`)
- Faculty Instructor Telemetry:
  - Assigned Faculty Name, Designation, and Qualification
  - Employee ID and Official Email contact
  - Cohort Section mapping
- Filter & Search:
  - Real-time client-side text filtering across Subject Code, Title, and Instructor Name.
  - Filter by Semester (All vs. Specific Semester).
  - Filter by Course Type (All, Theory, Practical/Lab, Project, Elective).
  - Deep-dive subject modal with complete syllabus and instructor overview.

### C. Weekly Class Timetable

- Day-by-day weekly schedule (`MONDAY` through `SATURDAY`) mapped directly to the student's assigned Section.
- Each timetable entry displays:
  - Day of Week and Time Interval (Start Time – End Time)
  - Time Slot designation (e.g., `Period 1`, `Morning Lab`)
  - Subject Name and Code
  - Classroom / Lab Venue (Resource Name, Code, and Category from Phase 10 Academic Resources)
  - Assigned Faculty Instructor

---

## 3. Security & Access Control

1. **Role-Based Endpoint Protection**:
   - All endpoints under `/api/student/academics/**` are secured with `@PreAuthorize("hasRole('STUDENT')")`.
   - Admin, Faculty, HOD, Warden, or unauthenticated users attempting to access these endpoints receive `403 Forbidden` or `401 Unauthorized`.

2. **Scoped Data Isolation**:
   - Endpoints do **NOT** accept arbitrary `studentId` query or path parameters.
   - The backend resolves the authenticated student from Spring Security's `Authentication.getName()` $\rightarrow$ `User` $\rightarrow$ `Student` entity.
   - If a user has role `STUDENT` but has no linked `Student` profile record, a `ResourceNotFoundException` is cleanly thrown.
   - Subjects and Timetable entries are strictly filtered by the student's linked `program.id` and `section.id`.

3. **Strictly Read-Only Operations**:
   - No `POST`, `PUT`, `PATCH`, or `DELETE` endpoints exist in the Student Academic Module.
   - Students cannot alter subjects, assignments, faculty allocations, or timetable periods.

---

## 4. API Endpoints

| Method | Endpoint | Description | Authorization |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/student/academics` | Complete student academic profile, overview, subjects, and timetable | `hasRole('STUDENT')` |
| `GET` | `/api/student/academics/subjects` | List of enrolled subjects for the student's program and semester | `hasRole('STUDENT')` |
| `GET` | `/api/student/academics/subjects/{id}` | Detailed subject view with instructor and section telemetry | `hasRole('STUDENT')` |
| `GET` | `/api/student/academics/timetable` | Weekly timetable entries for the student's assigned section | `hasRole('STUDENT')` |

---

## 5. DTO Data Models

### `StudentAcademicOverviewDto`

```json
{
  "studentId": 101,
  "studentName": "Alex Mercer",
  "registerNumber": "2023CS101",
  "rollNumber": "CS-042",
  "admissionYear": 2023,
  "currentSemester": 3,
  "status": "ACTIVE",
  "institutionId": 1,
  "institutionName": "Apex Institute of Technology",
  "institutionCode": "AIT",
  "departmentId": 2,
  "departmentName": "Computer Science & Engineering",
  "departmentCode": "CSE",
  "programId": 5,
  "programName": "B.Tech Computer Science",
  "programCode": "BT-CS",
  "degreeLevel": "UNDERGRADUATE",
  "durationYears": 4,
  "sectionId": 12,
  "sectionName": "A",
  "academicYearId": 3,
  "academicYearName": "2024-2025"
}
```

### `StudentSubjectDto`

```json
{
  "id": 401,
  "code": "CS301",
  "name": "Database Management Systems",
  "semesterNumber": 3,
  "subjectType": "THEORY",
  "credits": 4,
  "hoursPerWeek": 4,
  "status": "ACTIVE",
  "facultyId": 12,
  "facultyName": "Dr. Sarah Connor",
  "sectionId": 12,
  "sectionName": "A"
}
```

### `StudentTimetableEntryDto`

```json
{
  "id": 801,
  "dayOfWeek": "MONDAY",
  "startTime": "09:00:00",
  "endTime": "10:00:00",
  "timeSlotName": "Period 1",
  "subjectId": 401,
  "subjectName": "Database Management Systems",
  "subjectCode": "CS301",
  "resourceId": 22,
  "resourceName": "Seminar Hall A",
  "resourceCode": "SHA-101",
  "resourceCategory": "CLASSROOM",
  "facultyId": 12,
  "facultyName": "Dr. Sarah Connor"
}
```

---

## 6. Verification & Validation

- **Backend Unit & Security Tests**:
  - `StudentAcademicSecurityTest`: 5 integration tests validating RBAC rejection of unauthenticated users and non-student roles (`ADMIN`), and successful resolution of student endpoints.
  - `StudentAcademicServiceTest`: 6 service unit tests validating overview resolution, subject and credit aggregation, section timetable retrieval, and unauthorized subject detail boundary protection.
  - Maven test suite passing: `Tests run: 11, Failures: 0, Errors: 0, Skipped: 0`.
- **Frontend Production Compilation**:
  - TypeScript strict type checking (`tsc -b`): Passed with 0 errors.
  - Production Vite bundle: Compiled successfully.
