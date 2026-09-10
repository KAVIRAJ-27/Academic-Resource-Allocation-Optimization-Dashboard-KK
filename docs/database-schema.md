# AHRAO Database Architecture & Schema Documentation

This document provides a comprehensive technical reference for the relational database schema of the **Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)**.

---

## 1. Design Principles & Highlights

- **Normalization**: Fully compliant with Third Normal Form (3NF) to eliminate data redundancy and anomalies.
- **Identifier Strategy**: `BIGINT AUTO_INCREMENT` surrogate primary keys across all domain tables. Natural and business identifiers (`register_number`, `employee_id`, `username`, `email`, `code`) are protected by explicit `UNIQUE` constraints and B-Tree indexes.
- **Data Integrity**: Referential integrity enforced via foreign keys with explicit `ON DELETE RESTRICT` / `CASCADE` where appropriate (critical historical and audit logs preserve historical records without cascading deletes).
- **Migration & Schema Governance**: Managed via Flyway (`V1` to `V6`) with Hibernate configured in `validate` mode (`spring.jpa.hibernate.ddl-auto=validate`).
- **Temporal & Audit Tracking**: Standard timestamping (`created_at`, `updated_at`, `allocated_at`, `released_at`, `resolved_at`) and audit logs for auditing all critical lifecycle mutations.

---

## 2. Enumerations

| Enum Name | Values | Purpose |
| :--- | :--- | :--- |
| **UserStatus** | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING` | Account status for user accounts |
| **ResourceStatus** | `AVAILABLE`, `ALLOCATED`, `MAINTENANCE`, `INACTIVE` | Operational status of physical/academic resources |
| **RequestStatus** | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED` | Lifecycle status of resource and hostel requests |
| **AllocationStatus**| `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED` | Lifecycle state of active/historical allocations |
| **HostelBedStatus** | `AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `RESERVED`, `INACTIVE` | Allocation and physical state of each hostel bed |
| **ComplaintStatus** | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED` | Status tracking for hostel grievances |
| **MaintenanceStatus**| `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | Lifecycle state of maintenance work orders |
| **PriorityLevel** | `LOW`, `MEDIUM`, `HIGH`, `URGENT` | Priority categorization for requests & complaints |
| **ApprovalStatus** | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` | Outcome state for administrative approval gates |
| **ApprovalLevel** | `HOD`, `PRINCIPAL`, `ADMIN`, `WARDEN` | Workflow approval authority level |
| **HostelType** | `BOYS`, `GIRLS`, `COED`, `FACULTY_RESIDENCE` | Demographic categorization of hostels |
| **RoomType** | `SINGLE`, `DOUBLE`, `TRIPLE`, `FOUR_SHARING`, `DORMITORY` | Room occupancy capacity classification |
| **ResourceType** | `CLASSROOM`, `LABORATORY`, `EQUIPMENT`, `SOFTWARE`, `OTHER` | High-level categorization of academic resources |
| **DegreeType** | `UG`, `PG`, `DIPLOMA`, `PHD` | Degree academic tier |
| **SubjectType** | `THEORY`, `PRACTICAL`, `ELECTIVE`, `SEMINAR`, `PROJECT` | Classification of curriculum subject |

---

## 3. Core Database Tables & Specifications

### Migration V1: Security & Identity

#### `users`
- **Purpose**: System-wide authentication and identity registry for all roles.
- **Columns**:
  - `id` (BIGINT, PK, AUTO_INCREMENT)
  - `username` (VARCHAR(50), NOT NULL, UNIQUE)
  - `email` (VARCHAR(100), NOT NULL, UNIQUE)
  - `password_hash` (VARCHAR(255), NOT NULL)
  - `first_name` (VARCHAR(50), NOT NULL)
  - `last_name` (VARCHAR(50), NOT NULL)
  - `phone` (VARCHAR(20))
  - `status` (VARCHAR(20), NOT NULL, DEFAULT 'ACTIVE')
  - `created_at` (DATETIME, NOT NULL)
  - `updated_at` (DATETIME, NOT NULL)
  - `last_login_at` (DATETIME)
- **Indexes**: `idx_users_username`, `idx_users_email`, `idx_users_status`

#### `roles`
- **Purpose**: Predefined system roles (`ADMIN`, `PRINCIPAL`, `HOD`, `FACULTY`, `STUDENT`, `WARDEN`).
- **Columns**: `id` (BIGINT, PK), `name` (VARCHAR(50), UNIQUE), `description` (VARCHAR(255))

#### `permissions`
- **Purpose**: Fine-grained privilege markers.
- **Columns**: `id` (BIGINT, PK), `name` (VARCHAR(100), UNIQUE), `description` (VARCHAR(255))

#### `user_roles`
- **Purpose**: Many-to-Many junction table linking users with roles.
- **Columns**: `user_id` (BIGINT, FK -> `users.id`), `role_id` (BIGINT, FK -> `roles.id`)
- **Constraints**: Composite PK / UNIQUE `(user_id, role_id)`

#### `role_permissions`
- **Purpose**: Many-to-Many junction table mapping roles to authorized permissions.
- **Columns**: `role_id` (BIGINT, FK -> `roles.id`), `permission_id` (BIGINT, FK -> `permissions.id`)
- **Constraints**: Composite PK / UNIQUE `(role_id, permission_id)`

---

### Migration V2: Academic Structure & Human Capital

#### `institution`
- **Purpose**: Top-level college or university entity.
- **Columns**: `id` (BIGINT, PK), `name` (VARCHAR(200)), `code` (VARCHAR(50), UNIQUE), `address`, `city`, `state`, `country`, `email`, `phone`, `website`, `created_at`, `updated_at`.

#### `departments`
- **Purpose**: Academic departments (e.g., Computer Science, Artificial Intelligence).
- **Columns**: `id` (BIGINT, PK), `institution_id` (BIGINT, FK), `name`, `code`, `description`, `status`, `created_at`, `updated_at`.
- **Constraints**: `UNIQUE (institution_id, code)`

#### `academic_years`
- **Purpose**: Academic calendar years (e.g., "2026-2027").
- **Columns**: `id` (BIGINT, PK), `institution_id` (BIGINT, FK), `name`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`.
- **Constraints**: `UNIQUE (institution_id, name)`

#### `semesters`
- **Purpose**: Semester divisions within an academic year (Semester 1 through 8).
- **Columns**: `id` (BIGINT, PK), `academic_year_id` (BIGINT, FK), `name`, `number`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`.
- **Constraints**: `UNIQUE (academic_year_id, number)`

#### `programs`
- **Purpose**: Degree offerings (e.g., B.Tech AI & Data Science).
- **Columns**: `id` (BIGINT, PK), `department_id` (BIGINT, FK), `name`, `code`, `degree_type`, `duration_years`, `status`, `created_at`, `updated_at`.
- **Constraints**: `UNIQUE (department_id, code)`

#### `subjects`
- **Purpose**: Curricular subjects/courses mapped to programs and semesters.
- **Columns**: `id` (BIGINT, PK), `program_id` (BIGINT, FK), `semester_id` (BIGINT, FK), `code`, `name`, `credits`, `subject_type`, `status`, `created_at`, `updated_at`.
- **Constraints**: `UNIQUE (program_id, code)`

#### `sections`
- **Purpose**: Student class cohorts (Section A, B, C).
- **Columns**: `id` (BIGINT, PK), `program_id` (BIGINT, FK), `academic_year_id` (BIGINT, FK), `semester_id` (BIGINT, FK), `name`, `capacity`, `status`, `created_at`, `updated_at`.
- **Constraints**: `UNIQUE (program_id, academic_year_id, semester_id, name)`

#### `students`
- **Purpose**: Student profiles and academic records.
- **Columns**: `id` (BIGINT, PK), `user_id` (BIGINT, FK, UNIQUE), `department_id` (BIGINT, FK), `program_id` (BIGINT, FK), `section_id` (BIGINT, FK, nullable), `register_number` (VARCHAR(50), UNIQUE), `roll_number` (VARCHAR(50)), `admission_year`, `current_semester`, `status`, `created_at`, `updated_at`.

#### `faculty`
- **Purpose**: Academic teaching and research staff.
- **Columns**: `id` (BIGINT, PK), `user_id` (BIGINT, FK, UNIQUE), `department_id` (BIGINT, FK), `employee_id` (VARCHAR(50), UNIQUE), `designation`, `qualification`, `joining_date`, `status`, `created_at`, `updated_at`.

#### `department_hods`
- **Purpose**: Historical and active Head of Department leadership appointments.
- **Columns**: `id` (BIGINT, PK), `department_id` (BIGINT, FK), `faculty_id` (BIGINT, FK), `start_date`, `end_date`, `status`.

#### `principal_assignments`
- **Purpose**: Historical and active Principal administrative appointments.
- **Columns**: `id` (BIGINT, PK), `institution_id` (BIGINT, FK), `faculty_id` (BIGINT, FK), `start_date`, `end_date`, `status`.

#### `faculty_subject_assignments`
- **Purpose**: Teaching load assignment linking faculty, subject, section, and semester.
- **Columns**: `id` (BIGINT, PK), `faculty_id` (BIGINT, FK), `subject_id` (BIGINT, FK), `section_id` (BIGINT, FK), `academic_year_id` (BIGINT, FK), `semester_id` (BIGINT, FK), `hours_per_week`, `status`.

---

### Migration V3: Academic Resources & Scheduling

#### `resource_categories`
- **Purpose**: Resource taxonomy (`CLASSROOM`, `LABORATORY`, `EQUIPMENT`, `SOFTWARE`, `OTHER`).
- **Columns**: `id` (BIGINT, PK), `name` (VARCHAR(100), UNIQUE), `description`, `resource_type`, `status`.

#### `resources`
- **Purpose**: Unified catalog for physical, room, or digital resources. Supports both departmental and institution-wide assets.
- **Columns**: `id` (BIGINT, PK), `institution_id` (BIGINT, FK), `department_id` (BIGINT, FK, nullable), `category_id` (BIGINT, FK), `name`, `code` (VARCHAR(50), UNIQUE), `description`, `capacity`, `location`, `status`, `quantity`, `available_quantity`, `created_at`, `updated_at`.

#### `classrooms`
- **Purpose**: Detailed attributes for classroom spaces.
- **Columns**: `id` (BIGINT, PK), `resource_id` (BIGINT, FK, UNIQUE), `building`, `floor`, `room_number`, `capacity`, `room_type`, `has_projector`, `has_ac`, `has_smart_board`, `status`.

#### `laboratories`
- **Purpose**: Detailed attributes for computer and science labs.
- **Columns**: `id` (BIGINT, PK), `resource_id` (BIGINT, FK, UNIQUE), `building`, `floor`, `room_number`, `capacity`, `lab_type`, `computer_count`, `status`.

#### `equipment`
- **Purpose**: Detailed tracking for lab equipment and specialized hardware.
- **Columns**: `id` (BIGINT, PK), `resource_id` (BIGINT, FK), `serial_number` (VARCHAR(100), UNIQUE), `manufacturer`, `model`, `purchase_date`, `warranty_expiry`, `condition_status`, `quantity`, `status`.

#### `time_slots`
- **Purpose**: Standard institutional scheduling periods.
- **Columns**: `id` (BIGINT, PK), `institution_id` (BIGINT, FK), `name`, `day_of_week` (`MONDAY`..`SATURDAY`), `start_time`, `end_time`, `status`.

#### `timetable_entries`
- **Purpose**: Academic timetable matrix mapping section, subject, faculty, resource, and time slot.
- **Columns**: `id` (BIGINT, PK), `academic_year_id` (BIGINT, FK), `semester_id` (BIGINT, FK), `section_id` (BIGINT, FK), `subject_id` (BIGINT, FK), `faculty_id` (BIGINT, FK), `resource_id` (BIGINT, FK), `time_slot_id` (BIGINT, FK), `status`, `created_at`, `updated_at`.

---

### Migration V4: Hostel Structure & Occupancy Hierarchy

#### `hostels`
- **Purpose**: Residential building complexes.
- **Columns**: `id` (BIGINT, PK), `institution_id` (BIGINT, FK), `name`, `code` (VARCHAR(50), UNIQUE), `type` (`BOYS`, `GIRLS`, `COED`, `FACULTY_RESIDENCE`), `address`, `capacity`, `status`, `created_at`, `updated_at`.

#### `wardens`
- **Purpose**: Hostel supervisory personnel.
- **Columns**: `id` (BIGINT, PK), `user_id` (BIGINT, FK, UNIQUE), `employee_id` (VARCHAR(50), UNIQUE), `contact_number`, `status`, `created_at`, `updated_at`.

#### `warden_hostels`
- **Purpose**: Many-to-Many mapping of wardens assigned to hostels.
- **Columns**: `warden_id` (BIGINT, FK), `hostel_id` (BIGINT, FK). Composite PK `(warden_id, hostel_id)`.

#### `hostel_blocks`
- **Purpose**: Wing or block within a hostel.
- **Columns**: `id` (BIGINT, PK), `hostel_id` (BIGINT, FK), `name`, `code`, `number_of_floors`, `status`.
- **Constraints**: `UNIQUE (hostel_id, code)`

#### `hostel_floors`
- **Purpose**: Floor level within a block.
- **Columns**: `id` (BIGINT, PK), `hostel_block_id` (BIGINT, FK), `floor_number`, `name`, `status`.
- **Constraints**: `UNIQUE (hostel_block_id, floor_number)`

#### `hostel_rooms`
- **Purpose**: Living room units on a floor.
- **Columns**: `id` (BIGINT, PK), `hostel_floor_id` (BIGINT, FK), `room_number`, `room_type`, `capacity`, `status`.
- **Constraints**: `UNIQUE (hostel_floor_id, room_number)`

#### `hostel_beds`
- **Purpose**: Specific bed units within a room.
- **Columns**: `id` (BIGINT, PK), `hostel_room_id` (BIGINT, FK), `bed_number`, `status` (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`, `RESERVED`, `INACTIVE`), `created_at`, `updated_at`.
- **Constraints**: `UNIQUE (hostel_room_id, bed_number)`

#### `hostel_facilities`
- **Purpose**: Amenities associated with a hostel (Wi-Fi, Gym, Study Hall, Laundry).
- **Columns**: `id` (BIGINT, PK), `hostel_id` (BIGINT, FK), `name`, `description`, `quantity`, `status`.

---

### Migration V5: Allocations, Requests & Operational Workflows

#### `hostel_allocations`
- **Purpose**: Room/bed assignment records for students.
- **Columns**: `id` (BIGINT, PK), `student_id` (BIGINT, FK), `hostel_bed_id` (BIGINT, FK), `academic_year_id` (BIGINT, FK), `start_date`, `end_date`, `status` (`PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED`), `allocated_at`, `released_at`.
- **Indexes & Overlap Enforcement**: `idx_halloc_student_status`, `idx_halloc_bed_status`. Prepares enforcement so active allocations cannot double-assign a student or bed.

#### `academic_resource_requests`
- **Purpose**: Formal booking requests for laboratories, auditoriums, classrooms, or equipment.
- **Columns**: `id` (BIGINT, PK), `requester_user_id` (BIGINT, FK), `department_id` (BIGINT, FK), `resource_category_id` (BIGINT, FK), `requested_resource_id` (BIGINT, FK, nullable), `purpose`, `requested_date`, `start_time`, `end_time`, `quantity`, `priority`, `status`, `description`, `created_at`, `updated_at`.

#### `hostel_requests`
- **Purpose**: Student residential requests (e.g., Room Change, Hostel Transfer, Bed Change).
- **Columns**: `id` (BIGINT, PK), `student_id` (BIGINT, FK), `hostel_id` (BIGINT, FK), `request_type`, `description`, `priority`, `status`, `created_at`, `updated_at`.

#### `resource_allocations`
- **Purpose**: Confirmed reservation and schedule lock for academic resources.
- **Columns**: `id` (BIGINT, PK), `resource_id` (BIGINT, FK), `allocated_to_user_id` (BIGINT, FK), `department_id` (BIGINT, FK), `request_id` (BIGINT, FK, nullable), `academic_year_id` (BIGINT, FK), `semester_id` (BIGINT, FK), `time_slot_id` (BIGINT, FK, nullable), `start_datetime`, `end_datetime`, `quantity`, `purpose`, `status`, `allocated_by`, `created_at`, `updated_at`.

#### `approvals`
- **Purpose**: Multi-tier administrative sign-off journal for any request type.
- **Columns**: `id` (BIGINT, PK), `entity_type` (VARCHAR(50)), `entity_id` (BIGINT), `requested_by` (BIGINT, FK), `approved_by` (BIGINT, FK, nullable), `approval_level` (`HOD`, `PRINCIPAL`, `ADMIN`, `WARDEN`), `status` (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`), `comments`, `created_at`, `updated_at`.

#### `faculty_workloads`
- **Purpose**: Pre-computed and analytical teaching load figures per faculty per term.
- **Columns**: `id` (BIGINT, PK), `faculty_id` (BIGINT, FK), `academic_year_id` (BIGINT, FK), `semester_id` (BIGINT, FK), `total_hours`, `teaching_hours`, `lab_hours`, `other_hours`, `workload_status`, `calculated_at`.

#### `hostel_complaints`
- **Purpose**: Student maintenance and amenity issue tickets.
- **Columns**: `id` (BIGINT, PK), `student_id` (BIGINT, FK), `hostel_id` (BIGINT, FK), `room_id` (BIGINT, FK, nullable), `category` (`ELECTRICAL`, `PLUMBING`, `CLEANING`, `FOOD`, `SECURITY`, `ROOM`, `OTHER`), `title`, `description`, `priority`, `status`, `assigned_to` (BIGINT, FK, nullable), `created_at`, `updated_at`, `resolved_at`.

#### `maintenance_requests`
- **Purpose**: Physical facility and resource repair tickets.
- **Columns**: `id` (BIGINT, PK), `hostel_id` (BIGINT, FK, nullable), `resource_id` (BIGINT, FK, nullable), `room_id` (BIGINT, FK, nullable), `reported_by` (BIGINT, FK), `assigned_to` (BIGINT, FK, nullable), `title`, `description`, `priority`, `status`, `created_at`, `updated_at`, `completed_at`.

---

### Migration V6: Notifications, Auditing & Configuration

#### `notifications`
- **Purpose**: User alert registry for system events, approvals, and reminders.
- **Columns**: `id` (BIGINT, PK), `user_id` (BIGINT, FK), `title`, `message`, `notification_type`, `reference_type`, `reference_id`, `is_read`, `created_at`, `read_at`.

#### `audit_logs`
- **Purpose**: Immutable journal tracking security and data modifications.
- **Columns**: `id` (BIGINT, PK), `user_id` (BIGINT, FK, nullable), `action`, `entity_type`, `entity_id`, `old_value` (TEXT), `new_value` (TEXT), `ip_address`, `user_agent`, `created_at`.

#### `system_settings`
- **Purpose**: Global or institution-scoped configurable properties.
- **Columns**: `id` (BIGINT, PK), `institution_id` (BIGINT, FK, nullable), `setting_key` (VARCHAR(100), UNIQUE), `setting_value`, `description`, `updated_by`, `created_at`, `updated_at`.
