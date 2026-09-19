# Faculty Courses, Subjects & Timetable Module (Phase 18)

PROJECT: Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)

## 1. Overview

The **Faculty Courses, Subjects & Timetable Module** delivers a role-scoped, production-ready, read-only academic interface for authenticated faculty members (`ROLE_FACULTY`). It allows faculty to:

1. Review degree programs/courses legitimately associated with their academic assignments (`/faculty/academics`, `/faculty/courses`).
2. Search, filter, and inspect curriculum subjects assigned to them (`/faculty/subjects`), including semester, academic year, credits, and student sections.
3. Access in-depth subject details (`/faculty/subjects/:id`) with strict backend ownership verification that ensures only assigned subjects can be viewed.
4. View their complete weekly instruction schedule (`/faculty/timetable`), along with dynamically calculated **Today's Classes** based on the server system date and time.
5. Filter timetable sessions by Day of the Week, Subject, and Section, with classroom/laboratory venue and location telemetry.
6. Experience graceful Dark SaaS UI/UX adhering to `#080A0F` background, `#11141C` cards, and Teal/Purple accents, with accessible empty states and loading skeletons.

---

## 2. Security & Ownership Architecture

### A. Zero-Trust Identity Resolution

In adherence to strict project security guidelines, faculty endpoints **never** trust a `facultyId` or `userId` supplied by the frontend client. Identity is derived strictly from Spring Security's authenticated JWT principal:

```text
JWT Authenticated Principal
             ↓
  SecurityUtils.getCurrentUserId()
             ↓
       User Entity
             ↓
     Faculty Entity (via facultyRepository.findByUserId(userId))
```

### B. Read-Only Policy

Faculty members are **not** permitted to:

- Create, modify, assign, or delete courses/programs.
- Create, modify, or delete subjects or syllabus configurations.
- Self-assign subjects or class sections.
- Create, edit, move, reschedule, or delete timetable entries or time slots.
- Change classroom, laboratory, or resource reservations.

All administrative mutations belong strictly to Admin and HOD workflows.

### C. Strict Scope & Assignment Verification

- `GET /api/faculty/subjects/{id}`:

  Validates `facultySubjectAssignmentRepository.existsByFacultyIdAndSubjectId(faculty.getId(), subjectId)`.
  If the subject is not assigned to the authenticated faculty member, a `ResourceNotFoundException` is thrown, preventing unauthorized data discovery.

- `GET /api/faculty/timetable`:

  Queries only active timetable entries where `te.faculty.id = :facultyId`. Timetable records of other faculty members are never exposed.

---

## 3. Database Schema Reuse

Phase 18 reuses existing schema entities without schema alterations or destructive DDL:

- `FacultySubjectAssignment`: Links `Faculty`, `Subject`, `Section`, `AcademicYear`, `Semester`, `hoursPerWeek`, `status`.
- `TimetableEntry`: Links `Faculty`, `Subject`, `Section`, `Resource` (room/lab), `TimeSlot`, `status`.
- `Program`: Belongs to `Department`, contains `name`, `code`, `degreeType`, `durationYears`.
- `Subject`: Belongs to `Program` and `Semester`, contains `name`, `code`, `credits`, `subjectType`.
- `Section`: Belongs to `Program`, `AcademicYear`, and `Semester`, contains `name`, `capacity`.
- `Resource`: Contains `name`, `code`, `capacity`, `location`, and `ResourceCategory`.
- `TimeSlot`: Contains `dayOfWeek`, `startTime`, `endTime`, `name`.

---

## 4. Backend API Specifications

### A. Academic Overview

- **Endpoint**: `GET /api/faculty/academics`
- **Security**: `@PreAuthorize("hasRole('FACULTY')")`
- **Response**:

  ```json
  {
    "success": true,
    "message": "Faculty academic overview retrieved successfully",
    "data": {
      "departmentId": 10,
      "departmentName": "Computer Science & Engineering",
      "departmentCode": "CSE",
      "institutionName": "Apex Institute of Technology",
      "assignedCoursesCount": 1,
      "assignedSubjectsCount": 2,
      "assignedSectionsCount": 2,
      "totalWeeklyInstructionHours": 7,
      "assignedPrograms": [ ... ],
      "assignedSubjects": [ ... ]
    }
  }
  ```

### B. Assigned Courses

- **Endpoint**: `GET /api/faculty/courses` (also `/api/faculty/academics/courses`)
- **Security**: `@PreAuthorize("hasRole('FACULTY')")`
- **Response**: List of `FacultyCourseDto` objects associated with current teaching assignments.

### C. Assigned Subjects (Paged & Filtered)

- **Endpoint**: `GET /api/faculty/subjects`
- **Security**: `@PreAuthorize("hasRole('FACULTY')")`
- **Query Parameters**:
  - `search` (optional): Case-insensitive match on subject code or name.
  - `programId` (optional): Filter by degree program ID.
  - `semester` (optional): Filter by semester number (1–8).
  - `page` (optional, default: `0`): Page index.
  - `size` (optional, default: `10`): Page size.
- **Response**: Standard `PagedResponse<FacultySubjectDto>` with totalElements, totalPages, and content.

### D. Subject Details

- **Endpoint**: `GET /api/faculty/subjects/{id}`
- **Security**: `@PreAuthorize("hasRole('FACULTY')")` + Assignment Ownership Verification.
- **Response**: `FacultySubjectDetailsDto` containing subject metadata, assigned sections with capacity, and associated timetable slots.

### E. Timetable Schedule

- **Endpoint**: `GET /api/faculty/timetable`
- **Security**: `@PreAuthorize("hasRole('FACULTY')")`
- **Query Parameters**:
  - `dayOfWeek` (optional): `MONDAY`, `TUESDAY`, etc. (or `ALL`).
  - `subjectId` (optional): Filter by assigned subject ID.
  - `sectionId` (optional): Filter by section ID.
  - `todayOnly` (optional, boolean): Filter only classes scheduled for the current system day.
- **Response**: `FacultyTimetableResponseDto` with `totalEntriesCount`, `todayEntriesCount`, `todayDayOfWeek`, `todayDate`, `todayEntries`, and `entries`.

### F. Today's Classes

- **Endpoint**: `GET /api/faculty/timetable/today`
- **Security**: `@PreAuthorize("hasRole('FACULTY')")`
- **Response**: List of `FacultyTimetableEntryDto` for the current system day.

---

## 5. Frontend Architecture

### A. Routes

- `/faculty/academics`: `FacultyAcademicsPage` (Academic Overview)
- `/faculty/courses`: Alias to `FacultyAcademicsPage`
- `/faculty/subjects`: `FacultySubjectsPage` (Search, Filter, Paged list)
- `/faculty/subjects/:id`: `FacultySubjectDetailsPage` (Subject details, sections, and room slots)
- `/faculty/timetable`: `FacultyTimetablePage` (Today's schedule, day filter, weekly grid/list)

### B. Components (`frontend/src/components/faculty/academic/`)

- `FacultyAcademicNavTabs`: Shared pill navigation bar across Overview, Subjects, and Timetable.
- `FacultyCourseCard`: Card presentation of academic programs with duration and assigned subjects badge.
- `FacultySubjectTable`: Responsive table (desktop) and card list (mobile) with view details action.
- `FacultySubjectFilters`: Search input, program selector, semester selector, and reset filter button.
- `FacultyTimetableFilters`: Day-of-week pill buttons, "Today's Classes Only" toggle, and reset button.
- `FacultyTodayClassesCard`: Dynamic card displaying today's scheduled classes and venues.
- `FacultyTimetableScheduleView`: Grouped timetable view sorted by natural week order and period times.
- `FacultyAcademicSkeleton`: Dark SaaS loading skeleton adhering to `#080A0F` / `#11141C` style tokens.

### C. Hooks & Services

- `useFacultyAcademics`: Manages overview and course allocations.
- `useFacultySubjects`: Manages paginated subjects with search and filters.
- `useFacultySubjectDetails`: Fetches and verifies individual subject details.
- `useFacultyTimetable`: Manages timetable entries, today's classes, and filters.
- `facultyAcademicApi`, `facultySubjectApi`, `facultyTimetableApi`: Axios client integration using existing JWT auth interceptors.

---

## 6. Verification & Test Suite

### A. Backend Unit & Security Tests

- `FacultyAcademicSecurityTest`: 9 tests verifying authentication and authorization across all 6 endpoints.
- `FacultyAcademicServiceTest`: 4 tests verifying overview aggregation, course extraction, and 404 handling.
- `FacultySubjectServiceTest`: 5 tests verifying search, program/semester filters, details retrieval, and strict ownership rejection.
- `FacultyTimetableServiceTest`: 5 tests verifying timetable generation, today's classes dynamic calculation, day filtering, and empty schedules.
- **Full Backend Regression**: 208 tests passed with 0 failures, 0 errors, 0 skipped.

### B. Frontend Verification

- TypeScript verification (`tsc -b`): Passed with 0 errors.
- Production bundle build (`vite build`): Built in 19.00s with 0 errors.
