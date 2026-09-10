-- ==============================================================================
-- AHRAO Database Migration: V3__create_academic_resources.sql
-- Domain: Physical & Academic Resources (Classrooms, Laboratories, Equipment, Slots, Timetables)
-- ==============================================================================

CREATE TABLE resource_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    resource_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uk_resource_categories_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT NOT NULL,
    department_id BIGINT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    capacity INT NOT NULL DEFAULT 60,
    location VARCHAR(150) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_resources_code UNIQUE (code),
    CONSTRAINT fk_resources_institution FOREIGN KEY (institution_id) REFERENCES institution (id) ON DELETE RESTRICT,
    CONSTRAINT fk_resources_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT fk_resources_category FOREIGN KEY (category_id) REFERENCES resource_categories (id) ON DELETE RESTRICT,
    INDEX idx_resources_code (code),
    INDEX idx_resources_dept (department_id),
    INDEX idx_resources_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE classrooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(20) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    room_type VARCHAR(50) NOT NULL DEFAULT 'LECTURE_HALL',
    has_projector BOOLEAN NOT NULL DEFAULT TRUE,
    has_ac BOOLEAN NOT NULL DEFAULT FALSE,
    has_smart_board BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT uk_classrooms_resource UNIQUE (resource_id),
    CONSTRAINT fk_classrooms_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
    INDEX idx_classrooms_room (room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE laboratories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(20) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    capacity INT NOT NULL DEFAULT 30,
    lab_type VARCHAR(50) NOT NULL DEFAULT 'COMPUTER_LAB',
    computer_count INT NOT NULL DEFAULT 30,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT uk_laboratories_resource UNIQUE (resource_id),
    CONSTRAINT fk_laboratories_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
    INDEX idx_laboratories_type (lab_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    purchase_date DATE NULL,
    warranty_expiry DATE NULL,
    condition_status VARCHAR(50) NOT NULL DEFAULT 'GOOD',
    quantity INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT uk_equipment_serial UNIQUE (serial_number),
    CONSTRAINT fk_equipment_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE CASCADE,
    INDEX idx_equipment_serial (serial_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE time_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_time_slots_institution FOREIGN KEY (institution_id) REFERENCES institution (id) ON DELETE RESTRICT,
    INDEX idx_time_slots_day (day_of_week),
    INDEX idx_time_slots_time (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE timetable_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    academic_year_id BIGINT NOT NULL,
    semester_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    faculty_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    time_slot_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_timetable_year FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_semester FOREIGN KEY (semester_id) REFERENCES semesters (id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_section FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_faculty FOREIGN KEY (faculty_id) REFERENCES faculty (id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_resource FOREIGN KEY (resource_id) REFERENCES resources (id) ON DELETE RESTRICT,
    CONSTRAINT fk_timetable_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots (id) ON DELETE RESTRICT,
    INDEX idx_timetable_section_slot (section_id, time_slot_id),
    INDEX idx_timetable_faculty_slot (faculty_id, time_slot_id),
    INDEX idx_timetable_resource_slot (resource_id, time_slot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data: Resource Categories
INSERT INTO resource_categories (name, description, resource_type, status) VALUES
('Classrooms & Lecture Theatres', 'Smart classrooms and tiered lecture halls for curriculum instruction', 'CLASSROOM', 'ACTIVE'),
('Laboratories & Research Centers', 'Computational, physics, and chemistry laboratories', 'LABORATORY', 'ACTIVE'),
('Audio-Visual Equipment', 'Smart projectors, interactive boards, and microphone systems', 'EQUIPMENT', 'ACTIVE'),
('Academic Software & Licenses', 'Statistical, CAD, and machine learning cloud computing environments', 'SOFTWARE', 'ACTIVE'),
('Specialized Facility', 'Seminar halls, conference auditoriums, and robotics arenas', 'OTHER', 'ACTIVE');
