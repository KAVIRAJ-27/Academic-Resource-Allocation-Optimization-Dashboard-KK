# AHRAO Database Entity-Relationship (ER) Diagram

The following Mermaid diagrams illustrate the complete relational database architecture and hierarchies for the **Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)**.

---

## 1. High-Level System Relationships

```mermaid
erDiagram
    INSTITUTION ||--o{ DEPARTMENT : contains
    INSTITUTION ||--o{ HOSTEL : operates
    INSTITUTION ||--o{ ACADEMIC_YEAR : schedules
    INSTITUTION ||--o{ RESOURCE : owns

    DEPARTMENT ||--o{ PROGRAM : offers
    PROGRAM ||--o{ SUBJECT : includes
    PROGRAM ||--o{ SECTION : divides

    USER ||--o| STUDENT : identified_as
    USER ||--o| FACULTY : identified_as
    USER ||--o| WARDEN : identified_as
    USER }|--|{ ROLE : assigned

    HOSTEL ||--o{ HOSTEL_BLOCK : consists_of
    HOSTEL_BLOCK ||--o{ HOSTEL_FLOOR : contains
    HOSTEL_FLOOR ||--o{ HOSTEL_ROOM : contains
    HOSTEL_ROOM ||--o{ HOSTEL_BED : contains

    STUDENT ||--o{ HOSTEL_ALLOCATION : occupies
    HOSTEL_BED ||--o{ HOSTEL_ALLOCATION : assigned_to

    RESOURCE_CATEGORY ||--o{ RESOURCE : categorizes
    RESOURCE ||--o| CLASSROOM : specializes
    RESOURCE ||--o| LABORATORY : specializes
    RESOURCE ||--o{ EQUIPMENT : contains
    RESOURCE ||--o{ RESOURCE_ALLOCATION : reserved_in
```

---

## 2. Academic Hierarchy & Teaching Load

```mermaid
erDiagram
    INSTITUTION {
        bigint id PK
        varchar code UK
        varchar name
    }

    DEPARTMENT {
        bigint id PK
        bigint institution_id FK
        varchar code
        varchar name
    }

    ACADEMIC_YEAR {
        bigint id PK
        bigint institution_id FK
        varchar name
        date start_date
        date end_date
    }

    SEMESTER {
        bigint id PK
        bigint academic_year_id FK
        int number
        varchar name
    }

    PROGRAM {
        bigint id PK
        bigint department_id FK
        varchar code
        varchar name
        varchar degree_type
    }

    SUBJECT {
        bigint id PK
        bigint program_id FK
        bigint semester_id FK
        varchar code
        varchar name
        int credits
    }

    SECTION {
        bigint id PK
        bigint program_id FK
        bigint academic_year_id FK
        bigint semester_id FK
        varchar name
        int capacity
    }

    STUDENT {
        bigint id PK
        bigint user_id FK,UK
        bigint department_id FK
        bigint program_id FK
        bigint section_id FK
        varchar register_number UK
        varchar roll_number
    }

    FACULTY {
        bigint id PK
        bigint user_id FK,UK
        bigint department_id FK
        varchar employee_id UK
        varchar designation
    }

    DEPARTMENT_HOD {
        bigint id PK
        bigint department_id FK
        bigint faculty_id FK
        date start_date
        date end_date
    }

    PRINCIPAL_ASSIGNMENT {
        bigint id PK
        bigint institution_id FK
        bigint faculty_id FK
        date start_date
        date end_date
    }

    FACULTY_SUBJECT_ASSIGNMENT {
        bigint id PK
        bigint faculty_id FK
        bigint subject_id FK
        bigint section_id FK
        bigint academic_year_id FK
        bigint semester_id FK
        int hours_per_week
    }

    FACULTY_WORKLOAD {
        bigint id PK
        bigint faculty_id FK
        bigint academic_year_id FK
        bigint semester_id FK
        int total_hours
        int teaching_hours
    }

    INSTITUTION ||--o{ DEPARTMENT : "has"
    INSTITUTION ||--o{ ACADEMIC_YEAR : "schedules"
    INSTITUTION ||--o{ PRINCIPAL_ASSIGNMENT : "appoints"
    ACADEMIC_YEAR ||--o{ SEMESTER : "partitions"
    DEPARTMENT ||--o{ PROGRAM : "curates"
    DEPARTMENT ||--o{ DEPARTMENT_HOD : "led_by"
    DEPARTMENT ||--o{ FACULTY : "employs"
    DEPARTMENT ||--o{ STUDENT : "enrolls"
    PROGRAM ||--o{ SUBJECT : "requires"
    PROGRAM ||--o{ SECTION : "cohorts"
    FACULTY ||--o{ DEPARTMENT_HOD : "serves_as"
    FACULTY ||--o{ PRINCIPAL_ASSIGNMENT : "appointed_as"
    FACULTY ||--o{ FACULTY_SUBJECT_ASSIGNMENT : "teaches"
    FACULTY ||--o{ FACULTY_WORKLOAD : "logged_in"
    SUBJECT ||--o{ FACULTY_SUBJECT_ASSIGNMENT : "assigned_to"
    SECTION ||--o{ FACULTY_SUBJECT_ASSIGNMENT : "instructed_in"
    SECTION ||--o{ STUDENT : "assigned_to"
```

---

## 3. Hostel Structure & Room/Bed Hierarchy

```mermaid
erDiagram
    INSTITUTION {
        bigint id PK
        varchar code UK
        varchar name
    }

    HOSTEL {
        bigint id PK
        bigint institution_id FK
        varchar code UK
        varchar name
        varchar type
        int capacity
    }

    WARDEN {
        bigint id PK
        bigint user_id FK,UK
        varchar employee_id UK
        varchar contact_number
    }

    WARDEN_HOSTEL {
        bigint warden_id PK,FK
        bigint hostel_id PK,FK
    }

    HOSTEL_BLOCK {
        bigint id PK
        bigint hostel_id FK
        varchar code
        varchar name
        int number_of_floors
    }

    HOSTEL_FLOOR {
        bigint id PK
        bigint hostel_block_id FK
        int floor_number
        varchar name
    }

    HOSTEL_ROOM {
        bigint id PK
        bigint hostel_floor_id FK
        varchar room_number
        varchar room_type
        int capacity
    }

    HOSTEL_BED {
        bigint id PK
        bigint hostel_room_id FK
        varchar bed_number
        varchar status
    }

    HOSTEL_FACILITY {
        bigint id PK
        bigint hostel_id FK
        varchar name
        int quantity
    }

    HOSTEL_ALLOCATION {
        bigint id PK
        bigint student_id FK
        bigint hostel_bed_id FK
        bigint academic_year_id FK
        date start_date
        date end_date
        varchar status
    }

    HOSTEL_REQUEST {
        bigint id PK
        bigint student_id FK
        bigint hostel_id FK
        varchar request_type
        varchar priority
        varchar status
    }

    HOSTEL_COMPLAINT {
        bigint id PK
        bigint student_id FK
        bigint hostel_id FK
        bigint room_id FK
        varchar category
        varchar priority
        varchar status
    }

    INSTITUTION ||--o{ HOSTEL : "manages"
    HOSTEL ||--o{ HOSTEL_BLOCK : "divided_into"
    HOSTEL ||--o{ HOSTEL_FACILITY : "features"
    HOSTEL }|--|{ WARDEN : "managed_by (via WARDEN_HOSTEL)"
    HOSTEL_BLOCK ||--o{ HOSTEL_FLOOR : "elevates"
    HOSTEL_FLOOR ||--o{ HOSTEL_ROOM : "contains"
    HOSTEL_ROOM ||--o{ HOSTEL_BED : "contains"
    HOSTEL_BED ||--o{ HOSTEL_ALLOCATION : "leased_in"
    STUDENT ||--o{ HOSTEL_ALLOCATION : "occupant_of"
    STUDENT ||--o{ HOSTEL_REQUEST : "initiates"
    STUDENT ||--o{ HOSTEL_COMPLAINT : "files"
```

---

## 4. Academic Resource Allocation & Timetable Conflict Model

```mermaid
erDiagram
    RESOURCE_CATEGORY {
        bigint id PK
        varchar name UK
        varchar resource_type
    }

    RESOURCE {
        bigint id PK
        bigint institution_id FK
        bigint department_id FK
        bigint category_id FK
        varchar code UK
        varchar name
        int capacity
        varchar status
    }

    CLASSROOM {
        bigint id PK
        bigint resource_id FK,UK
        varchar building
        varchar room_number
        boolean has_projector
        boolean has_ac
        boolean has_smart_board
    }

    LABORATORY {
        bigint id PK
        bigint resource_id FK,UK
        varchar building
        varchar room_number
        varchar lab_type
        int computer_count
    }

    EQUIPMENT {
        bigint id PK
        bigint resource_id FK
        varchar serial_number UK
        varchar manufacturer
        varchar model
    }

    TIME_SLOT {
        bigint id PK
        bigint institution_id FK
        varchar day_of_week
        time start_time
        time end_time
    }

    TIMETABLE_ENTRY {
        bigint id PK
        bigint academic_year_id FK
        bigint semester_id FK
        bigint section_id FK
        bigint subject_id FK
        bigint faculty_id FK
        bigint resource_id FK
        bigint time_slot_id FK
    }

    ACADEMIC_RESOURCE_REQUEST {
        bigint id PK
        bigint requester_user_id FK
        bigint department_id FK
        bigint resource_category_id FK
        bigint requested_resource_id FK
        date requested_date
        time start_time
        time end_time
        varchar status
    }

    RESOURCE_ALLOCATION {
        bigint id PK
        bigint resource_id FK
        bigint allocated_to_user_id FK
        bigint department_id FK
        bigint request_id FK
        datetime start_datetime
        datetime end_datetime
        varchar status
    }

    APPROVAL {
        bigint id PK
        varchar entity_type
        bigint entity_id
        bigint requested_by FK
        bigint approved_by FK
        varchar approval_level
        varchar status
    }

    RESOURCE_CATEGORY ||--o{ RESOURCE : "classifies"
    RESOURCE ||--o| CLASSROOM : "specializes_as"
    RESOURCE ||--o| LABORATORY : "specializes_as"
    RESOURCE ||--o{ EQUIPMENT : "contains"
    RESOURCE ||--o{ TIMETABLE_ENTRY : "scheduled_in"
    RESOURCE ||--o{ RESOURCE_ALLOCATION : "locked_for"
    TIME_SLOT ||--o{ TIMETABLE_ENTRY : "time_window"
    ACADEMIC_RESOURCE_REQUEST ||--o| RESOURCE_ALLOCATION : "satisfies"
    ACADEMIC_RESOURCE_REQUEST ||--o{ APPROVAL : "requires"
```
