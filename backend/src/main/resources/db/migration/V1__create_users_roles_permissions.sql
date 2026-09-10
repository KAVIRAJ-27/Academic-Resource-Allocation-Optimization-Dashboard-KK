-- ==============================================================================
-- AHRAO Database Migration: V1__create_users_roles_permissions.sql
-- Domain: Core User Identity, Roles, and Permission Governance
-- ==============================================================================

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    CONSTRAINT uk_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    CONSTRAINT uk_permissions_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    last_login_at DATETIME(6) NULL,
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    INDEX idx_users_status (status),
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data: Standard 6 Roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with institution-wide configuration and governance access'),
('PRINCIPAL', 'College Principal with institutional oversight, utilization monitoring, and approval rights'),
('HOD', 'Head of Department managing faculty, departmental course schedules, and allocations'),
('FACULTY', 'Academic Faculty member accessing personal timetables, workload, and requests'),
('STUDENT', 'Enrolled Student accessing enrolled courses, timetables, and hostel allocation'),
('WARDEN', 'Hostel Warden managing residential blocks, rooms, bed occupancies, and maintenance');

-- Initial Seed Data: Baseline Permissions
INSERT INTO permissions (name, description) VALUES
('USER_READ', 'View user accounts'),
('USER_WRITE', 'Create or update user accounts'),
('ACADEMIC_READ', 'View academic resources and schedules'),
('ACADEMIC_ALLOCATE', 'Allocate classrooms, laboratories, and lecture slots'),
('HOSTEL_READ', 'View hostel blocks, rooms, and occupancy status'),
('HOSTEL_ALLOCATE', 'Allocate beds and manage resident students'),
('APPROVAL_MANAGE', 'Review and approve resource and allocation requisitions'),
('SYSTEM_ADMIN', 'Manage system settings and audit telemetry');
