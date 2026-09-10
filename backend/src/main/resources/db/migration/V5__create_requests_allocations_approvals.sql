-- ==============================================================================
-- AHRAO Database Migration: V5__create_requests_allocations_approvals.sql
-- Domain: Requisitions, Allocations, Approvals, Workload, Complaints & Maintenance
-- ==============================================================================

CREATE TABLE hostel_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    hostel_bed_id BIGINT NOT NULL,
    academic_year_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    allocated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    released_at DATETIME(6) NULL,
    CONSTRAINT fk_h_alloc_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT,
    CONSTRAINT fk_h_alloc_bed FOREIGN KEY (hostel_bed_id) REFERENCES hostel_beds (id) ON DELETE RESTRICT,
    CONSTRAINT fk_h_alloc_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE RESTRICT,
    INDEX idx_h_alloc_student_status (student_id, status),
    INDEX idx_h_alloc_bed_status (hostel_bed_id, status),
    INDEX idx_h_alloc_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE academic_resource_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_user_id BIGINT NOT NULL,
    department_id BIGINT NULL,
    resource_category_id BIGINT NOT NULL,
    requested_resource_id BIGINT NULL,
    purpose VARCHAR(255) NOT NULL,
    requested_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_ar_req_user FOREIGN KEY (requester_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ar_req_dept FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT fk_ar_req_category FOREIGN KEY (resource_category_id) REFERENCES resource_categories (id) ON DELETE RESTRICT,
    CONSTRAINT fk_ar_req_resource FOREIGN KEY (requested_resource_id) REFERENCES resources (id) ON DELETE SET NULL,
    INDEX idx_ar_req_status (status),
    INDEX idx_ar_req_requester (requester_user_id),
    INDEX idx_ar_req_date (requested_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostel_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    hostel_id BIGINT NOT NULL,
    request_type VARCHAR(50) NOT NULL DEFAULT 'ROOM_CHANGE',
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_hr_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT,
    CONSTRAINT fk_hr_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON DELETE RESTRICT,
    INDEX idx_hr_status (status),
    INDEX idx_hr_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resource_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    allocated_to_user_id BIGINT NOT NULL,
    department_id BIGINT NULL,
    request_id BIGINT NULL,
    academic_year_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    time_slot_id BIGINT NULL,
    start_datetime DATETIME(6) NOT NULL,
    end_datetime DATETIME(6) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    purpose VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    allocated_by BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_res_alloc_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE RESTRICT,
    CONSTRAINT fk_res_alloc_user FOREIGN KEY (allocated_to_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_res_alloc_dept FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT fk_res_alloc_request FOREIGN KEY (request_id) REFERENCES academic_resource_requests (id) ON DELETE SET NULL,
    CONSTRAINT fk_res_alloc_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT fk_res_alloc_semester FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE RESTRICT,
    CONSTRAINT fk_res_alloc_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots (id) ON DELETE SET NULL,
    CONSTRAINT fk_res_alloc_by FOREIGN KEY (allocated_by) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_res_alloc_resource (resource_id),
    INDEX idx_res_alloc_status (status),
    INDEX idx_res_alloc_window (start_datetime, end_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    approved_by BIGINT NULL,
    approval_level VARCHAR(30) NOT NULL DEFAULT 'HOD',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    comments TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_approvals_requested_by FOREIGN KEY (requested_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_approvals_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_approvals_entity (entity_type, entity_id),
    INDEX idx_approvals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faculty_workloads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    academic_year_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    total_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    teaching_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    lab_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    other_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    workload_status VARCHAR(30) NOT NULL DEFAULT 'BALANCED',
    calculated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_workload_faculty FOREIGN KEY (faculty_id) REFERENCES faculty (id) ON DELETE RESTRICT,
    CONSTRAINT fk_workload_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT fk_workload_semester FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE RESTRICT,
    INDEX idx_workload_faculty (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostel_complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    hostel_id BIGINT NOT NULL,
    room_id BIGINT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'ROOM',
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    assigned_to BIGINT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    resolved_at DATETIME(6) NULL,
    CONSTRAINT fk_complaints_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaints_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaints_room FOREIGN KEY (room_id) REFERENCES hostel_rooms (id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_assigned FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_hostel (hostel_id),
    INDEX idx_complaints_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE maintenance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_id BIGINT NULL,
    resource_id BIGINT NULL,
    room_id BIGINT NULL,
    reported_by BIGINT NOT NULL,
    assigned_to BIGINT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    completed_at DATETIME(6) NULL,
    CONSTRAINT fk_maint_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON DELETE SET NULL,
    CONSTRAINT fk_maint_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE SET NULL,
    CONSTRAINT fk_maint_room FOREIGN KEY (room_id) REFERENCES hostel_rooms (id) ON DELETE SET NULL,
    CONSTRAINT fk_maint_reporter FOREIGN KEY (reported_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_maint_assignee FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_maint_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
