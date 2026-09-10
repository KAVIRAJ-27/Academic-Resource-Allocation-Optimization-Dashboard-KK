-- ==============================================================================
-- AHRAO Database Migration: V4__create_hostel_structure.sql
-- Domain: Hostel Infrastructure (Hostels, Blocks, Floors, Rooms, Beds, Facilities & Wardens)
-- ==============================================================================

CREATE TABLE hostels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    institution_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'BOYS',
    address VARCHAR(255) NULL,
    capacity INT NOT NULL DEFAULT 200,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_hostels_code UNIQUE (code),
    CONSTRAINT fk_hostels_institution FOREIGN KEY (institution_id) REFERENCES institution (id) ON DELETE RESTRICT,
    INDEX idx_hostels_inst (institution_id),
    INDEX idx_hostels_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wardens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    contact_number VARCHAR(25) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_wardens_user UNIQUE (user_id),
    CONSTRAINT uk_wardens_employee UNIQUE (employee_id),
    CONSTRAINT fk_wardens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    INDEX idx_wardens_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE warden_hostels (
    warden_id BIGINT NOT NULL,
    hostel_id BIGINT NOT NULL,
    assigned_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (warden_id, hostel_id),
    CONSTRAINT fk_warden_hostels_warden FOREIGN KEY (warden_id) REFERENCES wardens (id) ON DELETE CASCADE,
    CONSTRAINT fk_warden_hostels_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostel_blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    number_of_floors INT NOT NULL DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uk_hostel_blocks_hostel_code UNIQUE (hostel_id, code),
    CONSTRAINT fk_hostel_blocks_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON DELETE RESTRICT,
    INDEX idx_blocks_hostel (hostel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostel_floors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_block_id BIGINT NOT NULL,
    floor_number INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uk_floors_block_num UNIQUE (hostel_block_id, floor_number),
    CONSTRAINT fk_floors_block FOREIGN KEY (hostel_block_id) REFERENCES hostel_blocks (id) ON DELETE RESTRICT,
    INDEX idx_floors_block (hostel_block_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostel_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_floor_id BIGINT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(50) NOT NULL DEFAULT 'DOUBLE',
    capacity INT NOT NULL DEFAULT 2,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT uk_rooms_floor_num UNIQUE (hostel_floor_id, room_number),
    CONSTRAINT fk_rooms_floor FOREIGN KEY (hostel_floor_id) REFERENCES hostel_floors (id) ON DELETE RESTRICT,
    INDEX idx_rooms_floor (hostel_floor_id),
    INDEX idx_rooms_number (room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostel_beds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_room_id BIGINT NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_beds_room_num UNIQUE (hostel_room_id, bed_number),
    CONSTRAINT fk_beds_room FOREIGN KEY (hostel_room_id) REFERENCES hostel_rooms (id) ON DELETE RESTRICT,
    INDEX idx_beds_room (hostel_room_id),
    INDEX idx_beds_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostel_facilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hostel_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    quantity INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_facilities_hostel FOREIGN KEY (hostel_id) REFERENCES hostels (id) ON DELETE RESTRICT,
    INDEX idx_facilities_hostel (hostel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
